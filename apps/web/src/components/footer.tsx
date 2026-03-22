export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          © {currentYear} Real Spanish Stories
        </p>
      </div>
    </footer>
  )
}
