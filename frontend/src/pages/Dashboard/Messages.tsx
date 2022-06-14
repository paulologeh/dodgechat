import { Tab } from 'semantic-ui-react'

const panes = [
  { menuItem: 'Helen', render: () => <Tab.Pane>Tab 1 Content</Tab.Pane> },
  { menuItem: 'Matthew', render: () => <Tab.Pane>Tab 2 Content</Tab.Pane> },
  { menuItem: 'Molly', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
]

export const Messages = () => {
  return (
    <div>
      <Tab
        menu={{ fluid: true, vertical: true, tabular: true }}
        panes={panes}
      />
    </div>
  )
}
