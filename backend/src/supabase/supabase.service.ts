import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import supabaseConfig from '../config/supabase.config';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(
    @Inject(supabaseConfig.KEY)
    private config: ConfigType<typeof supabaseConfig>,
  ) {
    // Public client (anon key)
    this.supabase = createClient(
      this.config.url!,
      this.config.anonKey!,
    );

    // Admin client (service role key)
    this.supabaseAdmin = createClient(
      this.config.url!,
      this.config.serviceRoleKey!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  // Auth methods
  async signUpWithEmail(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  async signInWithEmail(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signInWithGoogle(token: string) {
    return this.supabase.auth.signInWithIdToken({
      provider: 'google',
      token,
    });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async resetPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });
  }

  async verifyToken(token: string) {
    return this.supabase.auth.getUser(token);
  }

  async getUser(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error) throw error;
    return data.user;
  }

  // Storage methods
  async uploadFile(bucket: string, path: string, file: Buffer, contentType: string) {
    return this.supabaseAdmin.storage.from(bucket).upload(path, file, {
      contentType,
      upsert: true,
    });
  }

  async deleteFile(bucket: string, paths: string[]) {
    return this.supabaseAdmin.storage.from(bucket).remove(paths);
  }

  async getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
    return this.supabaseAdmin.storage.from(bucket).createSignedUrl(path, expiresIn);
  }

  getPublicUrl(bucket: string, path: string) {
    return this.supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  }
}
