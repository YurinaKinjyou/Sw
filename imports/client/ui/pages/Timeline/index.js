import { inject, observer } from 'mobx-react'
import compose from 'ramda/src/compose'
import React, { Component } from 'react'

import Layout from '/imports/client/ui/components/Layout'
import NowLoading from '/imports/client/ui/components/NowLoading'
import Sheet from '/imports/client/ui/components/Sheet'
import SheetContent from '/imports/client/ui/components/SheetContent'
import ChannelInfo from '/imports/client/ui/containers/ChannelInfo'
import CardPost from '/imports/client/ui/containers/CardPost/index'
import withPosts from '/imports/client/ui/hocs/withPosts'
import withRouter from '/imports/client/ui/hocs/withRouter'
import withScrollTop from '/imports/client/ui/hocs/withScrollTop'

class Timeline extends Component {
  render () {
    return (
      <Layout>
        {this.props.info.isOpen && <ChannelInfo />}
        {this.forPosts}
      </Layout>
    )
  }

  get forPosts () {
    if (this.props.posts.data.length === 0) {
      return (
        <Sheet>
          <SheetContent>
            {this.props.posts.loading && <NowLoading />}
          </SheetContent>
        </Sheet>
      )
    }
    return this.props.posts.data.map(item => <CardPost key={item._id} {...item} />)
  }
}

export default compose(
  withRouter,
  withPosts(),
  withScrollTop,
  inject(stores => ({info: stores.info})),
  observer
)(Timeline)
