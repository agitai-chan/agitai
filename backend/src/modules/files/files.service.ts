import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor(private supabaseService: SupabaseService) {}

  async uploadFile(
    bucket: string,
    file: Express.Multer.File,
    folder?: string,
  ): Promise<{ url: string; path: string }> {
    const fileName = `${uuidv4()}-${file.originalname}`;
    const path = folder ? `${folder}/${fileName}` : fileName;

    const { error } = await this.supabaseService.uploadFile(
      bucket,
      path,
      file.buffer,
      file.mimetype,
    );

    if (error) {
      throw new Error(`파일 업로드 실패: ${error.message}`);
    }

    const { data } = this.supabaseService.getPublicUrl(bucket, path);

    return {
      url: data.publicUrl,
      path,
    };
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabaseService.deleteFile(bucket, [path]);

    if (error) {
      throw new Error(`파일 삭제 실패: ${error.message}`);
    }
  }

  async getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await this.supabaseService.getSignedUrl(bucket, path, expiresIn);

    if (error) {
      throw new Error(`서명 URL 생성 실패: ${error.message}`);
    }

    return data.signedUrl;
  }
}
