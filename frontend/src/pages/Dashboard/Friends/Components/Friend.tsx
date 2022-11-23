import { Image, Item } from 'semantic-ui-react'
import { FriendMinimal } from 'types/api'

export const Friend = ({ data }: { data: FriendMinimal }) => {
  const { name, memberSince, aboutMe, gravatar } = data

  return (
    <Item>
      <Image src={gravatar} wrapped ui={false} />
      <Item.Content>
        <Item.Header>{name}</Item.Header>
        <Item.Meta>
          <span className="date">{memberSince}</span>
        </Item.Meta>
        <Item.Description>{aboutMe}</Item.Description>
      </Item.Content>
    </Item>
  )
}
