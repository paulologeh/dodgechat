import { Image, Item, Icon } from 'semantic-ui-react'
type friendPropTypes = {
  name?: string
  dateJoined: string
  aboutMe?: string
  noOfFriends: number
  avatar?: string
}

export const Friend = ({ data }: { data: friendPropTypes }) => {
  const { name, dateJoined, aboutMe, noOfFriends, avatar } = data

  return (
    <Item>
      <Image src={avatar} wrapped ui={false} />
      <Item.Content>
        <Item.Header>{name}</Item.Header>
        <Item.Meta>
          <span className="date">{dateJoined}</span>
        </Item.Meta>
        <Item.Description>{aboutMe}</Item.Description>
        <Item.Extra>
          <Icon name="user" />
          {noOfFriends} Friends
        </Item.Extra>
      </Item.Content>
    </Item>
  )
}
