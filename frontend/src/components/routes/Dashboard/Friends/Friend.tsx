type UserViewType = 'VIEW_ONLY' | 'INTERACT'

type FriendProps = {
  view: UserViewType
}

export const Friend = ({ view }: FriendProps) => {
  return (
    <>
      {view === 'VIEW_ONLY' && <div>VIEW ONLY</div>}
      {view === 'INTERACT' && <div>INTERACT</div>}
    </>
  )
}
