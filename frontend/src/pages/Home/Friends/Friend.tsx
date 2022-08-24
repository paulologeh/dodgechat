type UserViewType = 'VIEW_ONLY' | 'INTERACT'

type FriendPropType = {
  view: UserViewType
}

export const Friend = ({ view }: FriendPropType) => {
  return (
    <>
      {view === 'VIEW_ONLY' && <div>VIEW ONLY</div>}
      {view === 'INTERACT' && <div>INTERACT</div>}
    </>
  )
}
