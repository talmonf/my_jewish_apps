export default function TehillimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" lang="he">
      {children}
    </div>
  );
}
