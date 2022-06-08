import { Feed } from 'semantic-ui-react'

export const HomeFeed = () => (
  <Feed>
    <Feed.Event>
      <Feed.Label>
        <img
          src="https://react.semantic-ui.com/images/avatar/small/elliot.jpg"
          alt="eliot"
        />
      </Feed.Label>
      <Feed.Content>
        <Feed.Summary>
          <Feed.User>Elliot Fu</Feed.User> added you as a friend
          <Feed.Date>1 Hour Ago</Feed.Date>
        </Feed.Summary>
      </Feed.Content>
    </Feed.Event>

    <Feed.Event>
      <Feed.Label image="https://react.semantic-ui.com/images/avatar/small/helen.jpg" />
      <Feed.Content>
        <Feed.Summary>
          <Feed.User>Helen Troy</Feed.User> added
          <a href="/"> 2 new illustrations</a>
          <Feed.Date>4 days ago</Feed.Date>
        </Feed.Summary>
        <Feed.Extra images>
          <a href="/">
            <img
              src="https://react.semantic-ui.com/images/wireframe/image.png"
              alt="wireframe"
            />
          </a>
          <a href="/">
            <img
              src="https://react.semantic-ui.com/images/wireframe/image.png"
              alt="wireframe"
            />
          </a>
        </Feed.Extra>
      </Feed.Content>
    </Feed.Event>

    <Feed.Event>
      <Feed.Label image="https://react.semantic-ui.com/images/avatar/small/jenny.jpg" />
      <Feed.Content>
        <Feed.Summary
          date="2 Days Ago"
          user="Jenny Hess"
          content="add you as a friend"
        />
      </Feed.Content>
    </Feed.Event>

    <Feed.Event>
      <Feed.Label image="https://react.semantic-ui.com/images/avatar/small/joe.jpg" />
      <Feed.Content>
        <Feed.Summary>
          <Feed.User>Joe Henderson</Feed.User> posted on his page
          <Feed.Date>3 days ago</Feed.Date>
        </Feed.Summary>
        <Feed.Extra text>
          Ours is a life of constant reruns. We&apos;re always circling back to
          where we&apos;d we started, then starting all over again. Even if we
          don&apos;t run extra laps that day, we surely will come back for more
          of the same another day soon.
        </Feed.Extra>
      </Feed.Content>
    </Feed.Event>

    <Feed.Event>
      <Feed.Label image="https://react.semantic-ui.com/images/avatar/small/justen.jpg" />
      <Feed.Content>
        <Feed.Summary>
          <Feed.User>Justen Kitsune</Feed.User> added
          <a href="/"> 2 new photos</a> of you
          <Feed.Date>4 days ago</Feed.Date>
        </Feed.Summary>
        <Feed.Extra images>
          <a href="/">
            <img
              src="https://react.semantic-ui.com/images/wireframe/image.png"
              alt="wireframe"
            />
          </a>
          <a href="/">
            <img
              src="https://react.semantic-ui.com/images/wireframe/image.png"
              alt="wireframe"
            />
          </a>
        </Feed.Extra>
      </Feed.Content>
    </Feed.Event>
  </Feed>
)
