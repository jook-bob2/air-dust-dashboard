import Link from 'next/link';
import { MainLayout, Logo } from '@/components';

export default function NotFound() {
  return (
    <MainLayout>
      <section className='container mx-auto px-6 py-16 flex flex-col items-center justify-center text-center min-h-[60vh]'>
        <div className='w-40 h-40 mb-8 opacity-80 dark:opacity-90'>
          <Logo
            className='w-full h-full'
            aria-label='Logo'
            role='img'
          />
        </div>

        <h1 className='mt-2 text-4xl md:text-5xl font-extrabold text-foreground'>페이지를 찾을 수 없어요</h1>
        <p className='mt-4 max-w-xl text-muted-foreground'>
          요청하신 페이지가 사라졌거나 주소가 변경되었을 수 있어요. 홈으로 돌아가거나 상단 메뉴를 이용해 주세요.
        </p>

        <div className='mt-8 flex items-center gap-3'>
          <Link
            href='/'
            className='inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition'
            aria-label='홈으로 이동'>
            홈으로 가기
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
