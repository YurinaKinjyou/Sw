import { Meteor } from 'meteor/meteor'
import { HTTP } from 'meteor/http'
import { Random } from 'meteor/random'
import propTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import TextField from 'material-ui/TextField'
import UIDropzone from '../../components/UI-Dropzone'
import Layout from '../../components/UI-Layout'
import Sheet from '../../components/UI-Sheet'
import SheetActions from '../../components/UI-SheetActions'
import SheetContent from '../../components/UI-SheetContent'

@inject('channels', 'snackbar')
@observer
export default class ChannelEdit extends Component {
  render () {
    const {
      channels: {one: channel}
    } = this.props
    return (
      <Layout>
        {/* name */}
        <Sheet>
          <SheetContent>
            <TextField
              value={this.state.name}
              maxLength={50}
              onChange={this.onChangeName}
              onBlur={this.onSubmitName} />
          </SheetContent>
        </Sheet>
        {/* header */}
        <Sheet>
          <SheetActions>
            <UIDropzone
              src={Meteor.settings.public.assets.channel.root + channel._id + '/' + this.state.header}
              onDrop={this.onDropHeader} />
          </SheetActions>
        </Sheet>
        {/* description */}
        <Sheet>
          <SheetActions>
            <TextField multiline
              label='チャンネルの説明'
              placeholder='チャンネルの簡単な説明'
              value={this.state.description}
              maxLength='100'
              onChange={this.onInputDescription}
              onBlur={this.onSubmitDescription} />
          </SheetActions>
        </Sheet>
        {/* sns : web site */}
        <Sheet>
          <SheetContent>
            <TextField
              value={this.state.site || ''}
              label='web site'
              placeholder='https://swimmy.io'
              maxLength='20'
              onChange={this.onInputSocial.bind(this, 'site')}
              onBlur={this.onSubmitSocial} />
          </SheetContent>
        </Sheet>
        {/* sns : twitter */}
        <Sheet>
          <SheetContent>
            <TextField
              value={this.state.twitter || ''}
              label='twitter'
              placeholder='username'
              maxLength='20'
              onChange={this.onInputSocial.bind(this, 'twitter')}
              onBlur={this.onSubmitSocial} />
          </SheetContent>
        </Sheet>
        {/* school */}
        <Sheet>
          <SheetContent>
            <TextField
              value={this.state.univ}
              label='学校名'
              placeholder={'名桜大学'}
              maxLength='40'
              onChange={this.onInputUniv}
              onBlur={this.onSubmitUniv} />
          </SheetContent>
        </Sheet>
      </Layout>
    )
  }

  state = {
    name: this.props.channels.one.name,
    header: this.props.channels.one.header,
    number: this.props.channels.one.number,
    description: this.props.channels.one.description || '',
    channel: this.props.channels.one.channel,
    place: this.props.channels.one.place || '',
    site: this.props.channels.one.sns.site || '',
    twitter: this.props.channels.one.sns.twitter || '',
    email: this.props.channels.one.email || '',
    univ: this.props.channels.one.univ || '',
    tags: [
      this.props.channels.one.tags.slice()[0] || '',
      this.props.channels.one.tags.slice()[1] || '',
      this.props.channels.one.tags.slice()[2] || ''
    ],
    errorImageHeader: null
  }

  // チャンネルの名前を更新する
  onChangeName (event) {
    event.persist()
    const value = event.target.value
    if (value > 20) return
    if (value < 0) return
    this.setState({name: value})
  }

  onChangeName = ::this.onChangeName

  // チャンネルの名前の更新をサーバーに送信する
  onSubmitName () {
    if (this.props.channels.one.name === this.state.name) return
    const channelId = this.props.channels.one._id
    const next = this.state.name
    this.props.channels.updateBasic(channelId, 'name', next)
    .then(data => {
      this.props.channels.replaceOne(data)
      this.props.snackbar.show('更新しました')
    })
    .catch(err => this.props.snackbar.error(err.reason))
  }

  onSubmitName = ::this.onSubmitName

  // 画像をアップロードしてサーバーに送信する
  onDropHeader (acceptedFiles) {
    const file = acceptedFiles[0]
    const type = file.type
    const nameArray = file.name.split('.')
    const extension = nameArray[nameArray.length - 1].toLowerCase()
    if (type.indexOf('image') === -1) {
      this.setState({errorImageHeader: 'アップロードできるのはイメージデータのみです'})
      setTimeout(() => {
        this.setState({errorImageHeader: null})
      }, 4000)
      return
    }
    if (file.size > 5000000) {
      this.setState({errorImageHeader: 'サイズが5MBを超えています'})
      setTimeout(() => {
        this.setState({errorImageHeader: null})
      }, 4000)
      return
    }
    const imageName = 'header.' + extension
    const imageNameCache = imageName + '?uuid=' + Random.id()
    const formdata = new FormData()
    formdata.append('file', file)
    formdata.append('name_min', imageName)
    formdata.append('id', this.props.channels.one._id)
    if (Meteor.isDevelopment) {
      if (!Meteor.settings.public.api || !Meteor.settings.public.api.unique) {
        this.props.snackbar.errorMessage('開発環境では画像のアップロードは利用できません')
        this.process = false
        return
      }
      formdata.append('unique', Meteor.settings.public.api.unique)
    }
    this.setState({errorImageHeader: null})
    new Promise((resolve, reject) => {
      HTTP.post(Meteor.settings.public.api.channel.header, {content: formdata}, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
    .then(() => {
      const channelId = this.props.channels.one._id
      return this.props.channels.updateBasic(channelId, 'header', imageNameCache)
    })
    .then(data => {
      this.props.channels.replaceOne(data)
      this.props.snackbar.show('更新しました')
      this.setState({header: imageNameCache})
    })
    .catch(err => {
      this.props.snackbar.error(err)
      this.process = false
    })
  }

  onDropHeader = ::this.onDropHeader

  // チャンネルの説明を更新する
  onInputDescription (event) {
    event.persist()
    const value = event.target.value
    if (value > 100) return
    if (value < 0) return
    this.setState({description: value})
  }

  onInputDescription = ::this.onInputDescription

  // チャンネルの説明の更新をサーバーに送信する
  onSubmitDescription () {
    const channelId = this.props.channels.one._id
    const next = this.state.description
    if (this.props.channels.one.description === this.state.description) return
    this.props.channels.updateBasic(channelId, 'description', next)
    .then(data => {
      this.props.channels.replaceOne(data)
      this.props.snackbar.show('更新しました')
    })
    .catch(err => this.props.snackbar.error(err.reason))
  }

  onSubmitDescription = ::this.onSubmitDescription

  // 大学名を更新する
  onInputUniv (event) {
    event.persist()
    const value = event.target.value
    if (value > 100) return
    if (value < 0) return
    this.setState({univ: value})
  }

  onInputUniv = ::this.onInputUniv

  // 大学名の更新をサーバーに送信する
  onSubmitUniv () {
    const channelId = this.props.channels.one._id
    const next = this.state.univ
    if (this.props.channels.one.univ === this.state.univ) return
    this.props.channels.updateBasic(channelId, 'univ', next)
    .then(data => {
      this.props.channels.replaceOne(data)
      this.props.snackbar.show('更新しました')
    })
    .catch(err => this.props.snackbar.error(err.reason))
  }

  onSubmitUniv = ::this.onSubmitUniv

  // テキストを入力する
  onInputSocial (name, event) {
    event.persist()
    const value = event.target.value
    const object = {}
    object[name] = value
    this.setState(object)
  }

  // テキストの更新をサーバーに送信する
  onSubmitSocial () {
    const channelId = this.props.channels.one._id
    const next = {
      site: this.state.site,
      twitter: this.state.twitter,
      facebook: this.state.facebook
    }
    if (this.props.channels.one.sns.site === this.state.site &&
      this.props.channels.one.sns.twitter === this.state.twitter &&
      this.props.channels.one.sns.facebook === this.state.facebook) return
    this.props.channels.updateBasic(channelId, 'sns', next)
    .then(data => {
      this.props.channels.replaceOne(data)
      this.props.snackbar.show('更新しました')
    })
    .catch(err => this.props.snackbar.error(err.reason))
  }

  onSubmitSocial = ::this.onSubmitSocial

  componentDidMount () {
    this.context.onScrollTop()
  }

  static get contextTypes () {
    return {
      onScrollTop: propTypes.any
    }
  }
}
