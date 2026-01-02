import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Camera, Save, LogOut } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { updateProfile } from '@/api/endpoints/auth';
import { useAuthStore } from '@/stores';
import { useFileUpload } from '@/hooks';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  nick_name: z.string().min(2, '닉네임은 2자 이상이어야 합니다.'),
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user, logout, setUser } = useAuthStore();

  // 파일 업로드 훅 사용
  const {
    file: profileImage,
    preview: imagePreview,
    error: imageError,
    handleFileSelect,
  } = useFileUpload({
    imageOnly: true,
    onError: (error) => toast.error(error.message),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nick_name: user?.nick_name || '',
      email: user?.email || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      updateProfile({
        ...data,
        profile_image: profileImage || undefined,
      }),
    onSuccess: (data) => {
      setUser({ ...user!, ...data });
      toast.success('프로필이 업데이트되었습니다.');
    },
    onError: () => {
      toast.error('프로필 업데이트에 실패했습니다.');
    },
  });

  const handleLogout = () => {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
      logout();
      toast.success('로그아웃되었습니다.');
    }
  };

  // 폼 변경 또는 이미지 선택 시 저장 버튼 활성화
  const hasChanges = isDirty || profileImage !== null;

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">프로필 설정</h1>
        <p className="mt-1 text-slate-500">계정 정보를 관리하세요</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <Card.Header>
            <Card.Title>프로필 정보</Card.Title>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-2xl font-bold text-slate-600">
                    {imagePreview || user?.profile_image ? (
                      <img
                        src={imagePreview || user?.profile_image}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.nick_name?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white hover:bg-primary-600">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{user?.nick_name}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  {imageError && (
                    <p className="mt-1 text-sm text-red-600">{imageError.message}</p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <Input
                label="닉네임"
                error={errors.nick_name?.message}
                {...register('nick_name')}
              />

              <Input
                label="이메일"
                type="email"
                disabled
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={!hasChanges} isLoading={updateMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <Card>
          <Card.Header>
            <Card.Title>계정</Card.Title>
          </Card.Header>
          <Card.Content>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
