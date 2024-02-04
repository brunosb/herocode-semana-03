export default function Container({ children }: { children: React.ReactNode }) {
  return <div className="px-4 max-w-7xl mx-auto">{children}</div>;
}
