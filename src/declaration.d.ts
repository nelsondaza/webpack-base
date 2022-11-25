declare module '*.md' {
  const content: string
  export default content
}

declare module '*.scss' {
  const styles: { [className: string]: string }
  export default styles
}

interface Window {
  APP: {
    addNotification: (...args: unknown[]) => void
    api_url: string
    AUTH_HEADERS: Record<string, string>
    call: (key: string, value: string) => void
    device: {
      os?: string
      appVersion?: string
      systemVersion?: string
      model?: string
      token?: string
    }
    env: {
      client: {
        id: string
        secret: string
      }
      [key: string]: Record<string, string>
    }
    Feature: Features
    history: Window.history
    notificationsAdd?: (...args: unknown[]) => void
    sentry: {
      [key: string]: Record<string, string>
    }
    static_url: string
    url: string
    version: string
    workbox: Workbox
  }
}

declare const FEATURES_FLAGS: Record<string, string>
declare const SYSTEM: Window.APP

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface GlobalReducerEvent {}

  type GlobalReducer<TState extends GlobalState> = (
    state: TState,
    event: {
      [EventType in keyof GlobalReducerEvent]: { type: EventType } & GlobalReducerEvent[EventType]
    }[keyof GlobalReducerEvent],
  ) => TState
}
