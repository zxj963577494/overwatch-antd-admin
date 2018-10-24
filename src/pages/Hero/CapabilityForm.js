import React, { PureComponent, Fragment } from 'react'
import { Table, Button, Input, Popconfirm, Divider, Select } from 'antd'
import nanoid from 'nanoid'
import isEqual from 'lodash/isEqual'
import styles from './style.less'

const { Option } = Select

class CapabilityForm extends PureComponent {
  cacheOriginData = {}

  constructor(props) {
    super(props)

    this.state = {
      data: props.value,
      loading: false,
      /* eslint-disable-next-line react/no-unused-state */
      value: props.value,
    }
  }

  static getDerivedStateFromProps(nextProps, preState) {
    if (isEqual(nextProps.value, preState.value)) {
      return null
    }
    return {
      data: nextProps.value,
      value: nextProps.value,
    }
  }

  getRowByKey(key, newData) {
    const { data } = this.state
    return (newData || data).filter(item => item.key === key)[0]
  }

  toggleEditable = (e, key) => {
    e.preventDefault()
    const { data } = this.state
    const newData = data.map(item => ({ ...item }))
    const target = this.getRowByKey(key, newData)
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target }
      }
      target.editable = !target.editable
      this.setState({ data: newData })
    }
  }

  newMember = () => {
    const { data } = this.state
    const newData = data.map(item => ({ ...item }))
    newData.push({
      key: nanoid(8),
      name: '',
      remark: '',
      score: '',
      isEnable: true,
      editable: true,
      isNew: true,
    })
    this.setState({ data: newData })
  }

  remove(key) {
    const { data } = this.state
    const { onChange } = this.props
    const newData = data.filter(item => item.key !== key)
    this.setState({ data: newData })
    onChange(newData)
  }

  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key)
    }
  }

  handleFieldChange(e, fieldName, key) {
    const { data } = this.state
    const newData = data.map(item => ({ ...item }))
    const target = this.getRowByKey(key, newData)
    if (target) {
      target[fieldName] = e.target.value
      this.setState({ data: newData })
    }
  }

  saveRow(e, key) {
    e.persist()
    this.setState({
      loading: true,
    })
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false
        return
      }
      const target = this.getRowByKey(key) || {}
      delete target.isNew
      this.toggleEditable(e, key)
      const { data } = this.state
      const { onChange } = this.props
      onChange(data)
      this.setState({
        loading: false,
      })
    }, 500)
  }

  cancel(e, key) {
    this.clickedCancel = true
    e.preventDefault()
    const { data } = this.state
    const newData = data.map(item => ({ ...item }))
    const target = this.getRowByKey(key, newData)
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key])
      delete this.cacheOriginData[key]
    }
    target.editable = false
    this.setState({ data: newData })
    this.clickedCancel = false
  }

  render() {
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={text}
                autoFocus
                onChange={e => this.handleFieldChange(e, 'name', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="名称"
              />
            )
          }
          return text
        },
      },
      {
        title: '分数',
        dataIndex: 'score',
        key: 'score',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                type="number"
                value={text}
                onChange={e => this.handleFieldChange(e, 'score', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="分数"
              />
            )
          }
          return text
        },
      },
      {
        title: '理由',
        dataIndex: 'remark',
        key: 'remark',
        width: '50%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'remark', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="理由"
              />
            )
          }
          return text
        },
      },
      {
        title: '启用',
        dataIndex: 'isEnable',
        key: 'isEnable',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Select
                defaultValue
                style={{ width: '100%' }}
                onChange={e => this.handleFieldChange(e, 'isEnable', record.key)}
              >
                <Option value>启用</Option>
                <Option value={false}>禁用</Option>
              </Select>
            )
          }
          return text
        },
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          const { loading } = this.state
          if (!!record.editable && loading) {
            return null
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <a onClick={e => this.saveRow(e, record.key)}>添加</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              )
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, record.key)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, record.key)}>取消</a>
              </span>
            )
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, record.key)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          )
        },
      },
    ]

    const { loading, data } = this.state

    return (
      <Fragment>
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          rowClassName={record => (record.editable ? styles.editable : '')}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newMember}
          icon="plus"
        >
          新增能力
        </Button>
      </Fragment>
    )
  }
}

export default CapabilityForm