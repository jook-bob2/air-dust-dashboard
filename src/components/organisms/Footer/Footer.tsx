type Props = {
  lastUpdated?: string;
};

export default function Footer({ lastUpdated }: Props) {
  return (
    <footer className='mt-10 text-center text-sm text-muted-foreground py-6 border-t border-border'>
      <p>데이터 출처: 환경부 에어코리아 (공공데이터포털)</p>
      {lastUpdated && <p>최종 측정 시각: {lastUpdated}</p>}
      <p>© {new Date().getFullYear()} 미세먼지 대시보드</p>
    </footer>
  );
}
