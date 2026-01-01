import { Button } from '@/shared/components/ui/button'

export function SkipToContent() {
  const handleSkip = () => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.tabIndex = -1
      mainContent.focus()
      setTimeout(() => {
        mainContent.removeAttribute('tabindex')
      }, 1000)
    }
  }

  return (
    <Button
      variant="secondary"
      onClick={handleSkip}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] shadow-lg"
    >
      Skip to content
    </Button>
  )
}
