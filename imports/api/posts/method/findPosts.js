import { Meteor } from 'meteor/meteor'

import { Posts } from '/imports/collection'
import createPathFromDate from '/imports/utils/createPathFromDate'
import replaceLink from '/imports/utils/replaceLink'

Meteor.methods({
  findPosts (selector, options) {
    if (selector.ownerId) {
      // then profile
      selector.owner = {$exists: true}
    }

    options.sort = {createdAt: -1}

    return Posts.find(selector, options).fetch()
    .map(post => {
      if (post.replyId) {
        const options = {
          fields: {
            _id: 1,
            content: 1,
            owner: 1,
            reactions: 1,
            extension: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
        const reply = Posts.findOne(post.replyId, options)
        if (reply) {
          post.reply = reply
        } else {
          post.reply = {
            content: 'この投稿は既に削除されています'
          }
        }
      }
      if (post.images) {
        post.imagePath =
          'https://storage.googleapis.com/' +
          Meteor.settings.private.googleCloud.bucket + '/' +
          createPathFromDate(post.createdAt)
      }

      if (post.link) post.content = replaceLink(post.content)

      if (this.userId !== post.ownerId) { delete post.ownerId }

      return post
    })
  }
})
