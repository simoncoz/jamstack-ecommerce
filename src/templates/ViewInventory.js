import React from 'react'
import getInventory from '../../providers/inventoryProvider'
import Image from '../components/Image'
import { Link } from 'gatsby'
import { slugify, numberFormat } from '../../utils/helpers'
import { FaTimes } from 'react-icons/fa'
import { API, graphqlOperation } from 'aws-amplify'
import { listProducts } from '../graphql/queries'
import { updateProduct, deleteProduct } from '../graphql/mutations'

class ViewInventory extends React.Component {
  state = {
    inventory: [],
    currentItem: {},
    editingIndex: []
  }
  componentDidMount() {
    this.fetchInventory()
  }
  fetchInventory = async() => {
    const inventoryData = await API.graphql(graphqlOperation(listProducts))
    const { items } = inventoryData.data.listProducts
    console.log("inventory items: ", items)
    this.setState({ inventory: items })
  }
  editItem = (item, index) => {
    const editingIndex = index
    this.setState({ editingIndex, currentItem: item })    
  }
  saveItem = async index => {
    console.log("saveItem: ", this.state.currentItem)
    const inventory = [...this.state.inventory]
    inventory[index] = this.state.currentItem
    try{
      await API.graphql(graphqlOperation(updateProduct, { input: this.state.currentItem }))    
      this.setState({ editingIndex: null, inventory })
    } catch (e) {
      console.log("Exception: ", e)
    }
    
    console.log("saveItem END: ", this.state.currentItem)
  }
  
  deleteItem = async index => {
    const id = this.state.inventory[index].id
    const inventory = [...this.state.inventory.slice(0, index), ...this.state.inventory.slice(index + 1)]
    this.setState({ inventory })
    await API.graphql(graphqlOperation(deleteProduct, { input: { id }}))
  }
  onChange = event => {
    const currentItem = {
      ...this.state.currentItem,
      [event.target.name]: event.target.value
    }
    
    this.setState({ currentItem })
  }
  render() {
    const { inventory, currentItem, editingIndex } = this.state
    console.log('currentItem: ', currentItem)
    return (
      <div>
        <h2>Inventory</h2>
        {
          inventory.map((item, index) => {
            const isEditing = editingIndex === index
            if (isEditing) {
              return (
                <div className="border-b py-10" key={item.id}>
                  <div className="flex items-center">
                    <Link to={slugify(item.name)}>
                      <Image className="w-32 m-0" src={item.image} alt={item.name} />
                    </Link>
                    <input
                      onChange={(e) => this.onChange(e, index)}
                      className="ml-8 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={currentItem.name}
                      placeholder="Item name"
                      name="name"
                    />
                    <div className="flex flex-1 justify-end items-center">
                      <p className="m-0 text-sm mr-2">In stock:</p>
                      <input
                        onChange={this.onChange}
                        className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={currentItem.currentInventory}
                        name="currentInventory"
                        placeholder="Item inventory"
                      />
                      <p className="m-0 text-sm mr-2">Price:</p>
                      <input
                        onChange={this.onChange}
                        className="ml-16 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={currentItem.price}
                        name="price"
                        placeholder="Item price"
                      />
                    </div>
                    <div role="button" onClick={() => this.saveItem(index)} className="m-0 ml-10 text-gray-900 text-s cursor-pointer">
                      <p className="text-sm ml-10 m-0">Save</p>
                    </div>
                  </div>
                </div>
              )
            }
            return (
              <div className="border-b py-10" key={item.id}>
                <div className="flex items-center">
                  <Link to={slugify(item.name)}>
                    <Image className="w-32 m-0" src={item.image} alt={item.name} />
                  </Link>
                  <Link to={slugify(item.name)}>
                    <p className="m-0 pl-10 text-gray-600 text-sm">
                      {item.name}
                    </p>
                  </Link>
                  <div className="flex flex-1 justify-end">
                    <p className="m-0 pl-10 text-gray-900 tracking-tighter text-sm">In stock: {item.currentInventory}</p>
                    <p className="m-0 pl-20 text-gray-900 tracking-tighter font-semibold">
                      {numberFormat(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center m-0 ml-10 text-gray-900 text-s cursor-pointer">
                    <FaTimes onClick={() => this.deleteItem(index)} />
                    <p role="button" onClick={() => this.editItem(item, index)} className="text-sm ml-10 m-0">Edit</p>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default ViewInventory