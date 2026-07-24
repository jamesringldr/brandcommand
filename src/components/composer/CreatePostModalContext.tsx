import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { CreatePostModal } from './CreatePostModal'

type CreatePostModalContextValue = {
  openCreatePost: () => void
  closeCreatePost: () => void
}

const CreatePostModalContext =
  createContext<CreatePostModalContextValue | null>(null)

export function useCreatePostModal(): CreatePostModalContextValue {
  const ctx = useContext(CreatePostModalContext)
  if (!ctx) {
    throw new Error(
      'useCreatePostModal must be used within CreatePostModalProvider',
    )
  }
  return ctx
}

export function CreatePostModalProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  const openCreatePost = useCallback(() => setIsOpen(true), [])
  const closeCreatePost = useCallback(() => setIsOpen(false), [])

  return (
    <CreatePostModalContext.Provider
      value={{ openCreatePost, closeCreatePost }}
    >
      {children}
      {isOpen && <CreatePostModal onClose={closeCreatePost} />}
    </CreatePostModalContext.Provider>
  )
}
