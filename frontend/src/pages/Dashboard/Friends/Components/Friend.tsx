import { Image, Item } from 'semantic-ui-react'
import { friendMinimalType } from 'types/apiTypes'

export const Friend = ({ data }: { data: friendMinimalType }) => {
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
