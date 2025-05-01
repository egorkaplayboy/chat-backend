import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { StorageService } from './storage.service';
import { Response } from 'express';

@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Get('download/:id')
  async download(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.storage.download(id);

    res.set({
      'Content-Type': response.contentType,
      'Content-Disposition': `attachment; filename="${response.filename}"`,
    });

    return new StreamableFile(response.stream);
  }
}
