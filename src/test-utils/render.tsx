import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: {
    user?: {
      id?: string
      name?: string
      email?: string
    }
    expires: string
  } | null
}

function AllProviders({
  children,
  session,
}: {
  children: React.ReactNode
  session?: CustomRenderOptions['session']
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}

function customRender(
  ui: ReactElement,
  { session = null, ...options }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders session={session}>{children}</AllProviders>
    ),
    ...options,
  })
}

export * from '@testing-library/react'
export { customRender as render }
