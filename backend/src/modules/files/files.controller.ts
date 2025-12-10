import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '파일 업로드' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile('uploads', file);
  }

  @Delete(':path')
  @ApiOperation({ summary: '파일 삭제' })
  async deleteFile(@Param('path') path: string) {
    await this.filesService.deleteFile('uploads', path);
    return { message: '파일이 삭제되었습니다' };
  }
}
