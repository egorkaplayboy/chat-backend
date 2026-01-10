import { DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { randomUUID } from 'crypto';
import { SERVICE_METADATA } from '../decorators/service.decorator';

@Injectable()
export class RabbitBroker implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;
  private replyQueue: string;

  private correlationIdMap = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason?: any) => void;
      timeout: NodeJS.Timeout;
    }
  >();
  private readonly logger = new Logger(RabbitBroker.name);

  constructor(
    private readonly config: ConfigService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  async onModuleInit() {
    await this.connect();
  }
  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      this.connection = await amqp.connect(
        this.config.getOrThrow('RABBIT_MQ_URL'),
      );

      this.channel = await this.connection.createChannel();

      await this.subscribeOnReply();

      await this.subscribeAll();
    } catch (error: any) {
      throw error;
    }
  }

  private async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }

      for (const handler of this.correlationIdMap.values()) {
        clearTimeout(handler.timeout);
        handler.reject('Connection closed');
      }
      this.correlationIdMap.clear();
    } catch (error: any) {
      throw error;
    }
  }

  async publish<I, O>(
    exchange: string,
    routeKey: string,
    args: I,
    timeoutMs: number | undefined,
  ): Promise<O> {
    return new Promise((resolve, reject) => {
      const buffer = Buffer.from(JSON.stringify(args));

      const correlationId = randomUUID();

      this.channel.publish(exchange, routeKey, buffer, {
        correlationId,
        replyTo: timeoutMs ? this.replyQueue : undefined,
      });

      if (!timeoutMs) {
        resolve({} as O);
        return;
      }

      const timeout = setTimeout(() => {
        const handler = this.correlationIdMap.get(correlationId);
        if (handler) {
          this.correlationIdMap.delete(correlationId);
          handler.reject(new Error('Request timeout'));
        }
      }, timeoutMs);

      this.correlationIdMap.set(correlationId, {
        resolve,
        reject,
        timeout,
      });
    });
  }

  private async subscribeOnReply() {
    const replyQueue = await this.channel.assertQueue(randomUUID(), {
      exclusive: true,
    });
    this.replyQueue = replyQueue.queue;

    await this.channel.consume(
      this.replyQueue,
      (msg: amqp.ConsumeMessage) => {
        if (msg) {
          const correlationId = msg.properties.correlationId;

          const handlers = this.correlationIdMap.get(correlationId);

          if (handlers) {
            clearTimeout(handlers.timeout);

            this.correlationIdMap.delete(correlationId);

            const content = msg.content.toString();
            const response = JSON.parse(content);

            if (msg.properties.headers?.error) {
              handlers.reject(new Error(response.message || 'Unknown error'));
            } else {
              handlers.resolve(response);
            }
          }

          this.channel.ack(msg);
        }
      },
      { noAck: false },
    );
  }

  private async subscribe(
    exchange: string,
    routeKey: string,
    handler: (...args: any[]) => any,
  ) {
    const queue = await this.createAndBindQueue(exchange, routeKey);

    this.channel.consume(
      queue,
      async (msg: amqp.ConsumeMessage) => {
        if (msg) {
          try {
            if (msg.fields.redelivered) throw new Error('Message redelivered');

            const content = msg.content.toString();
            const parsedMsg = JSON.parse(content);

            const response = await handler(...parsedMsg);

            if (msg.properties.replyTo) {
              this.channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify(response)),
                {
                  correlationId: msg.properties.correlationId,
                },
              );
            }

            this.channel.ack(msg);
          } catch (error: any) {
            this.channel.nack(msg, false, true);
          }
        }
      },
      { noAck: false },
    );
    this.logger.log(`RabbitMQ: ${queue} subscribed`);
  }

  private async createAndBindQueue(exchange: string, routeKey: string) {
    const queueName = `${exchange}.${routeKey}`;

    await this.channel.assertQueue(queueName);

    await this.channel.assertExchange(exchange, 'direct', {});

    await this.channel.bindQueue(queueName, exchange, routeKey);
    return queueName;
  }

  async subscribeAll() {
    const providers =
      await this.discoveryService.providersWithMetaAtKey(SERVICE_METADATA);

    for (const provider of providers) {
      const instance = provider.discoveredClass.instance;
      const methodNames = this.extractMethodNamesFromClass(instance);
      for (const methodName of methodNames) {
        await this.subscribe(
          provider.meta as string,
          methodName,
          instance[methodName].bind(instance),
        );
      }
    }
  }

  private extractMethodNamesFromClass(instance: any): string[] {
    const methodNames = new Set<string>();
    const excludeMethods = new Set([
      'onModuleInit',
      'onModuleDestroy',
      'constructor',
      'toString',
      'toJSON',
      'valueOf',
    ]);

    let proto = Object.getPrototypeOf(instance);

    while (proto && proto !== Object.prototype) {
      const propertyNames = Object.getOwnPropertyNames(proto);

      for (const propertyName of propertyNames) {
        if (
          !excludeMethods.has(propertyName) &&
          !propertyName.startsWith('_') &&
          propertyName !== 'constructor' &&
          typeof instance[propertyName] === 'function'
        ) {
          methodNames.add(propertyName);
        }
      }

      proto = Object.getPrototypeOf(proto);
    }

    return Array.from(methodNames);
  }
}
