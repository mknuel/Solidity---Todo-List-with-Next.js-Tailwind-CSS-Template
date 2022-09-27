import React, { useState, useEffect } from "react"
import WrongNetworkMessage from '../components/WrongNetworkMessage'
import ConnectWalletButton from '../components/ConnectWalletButton'
import TodoList from '../components/TodoList'
import TaskAbi from "../../backend/build/contracts/TaskContract.json"
import { TaskContractAddress } from "../config.js"
import { ethers } from "ethers"



/* 
const tasks = [
  { id: 0, taskText: 'clean', isDeleted: false }, 
  { id: 1, taskText: 'food', isDeleted: false }, 
  { id: 2, taskText: 'water', isDeleted: true }
]
*/

export default function Home() {
  const [correctNetwork, setCorrectNetwork] = useState(false)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [currentAccount, setCurrentAccount] = useState("")
  const [input, setInput] = useState("")
  const [tasks, setTasks] = useState([])
  // Calls Metamask to connect wallet on clicking Connect Wallet button


  useEffect(() => {
    connectWallet()
    getAllTasks()
  }, [])
  const connectWallet = async () => {
    try {

      const { ethereum } = window
      if (!ethereum) {
        console.error("metamask not defined")
        throw "Metamask not defined"
      }

      const chainId = await ethereum.request({
        method: "eth_chainId"
      })

      console.log(chainId)

      const devChainId = "0x539"


      if (chainId != devChainId) {
        setCorrectNetwork(false)
        alert("you are not connected the dev chain")
        throw "you are not connected the dev chain"
      } else {
        setCorrectNetwork(true)
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })


      console.log("found account", accounts[0])
      setCurrentAccount(accounts[0])
      setIsUserLoggedIn(true)




    } catch (err) {
      console.error(err)
    }

  }

  // Just gets all the tasks from the contract
  const getAllTasks = async () => {

    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(TaskContractAddress, TaskAbi.abi, signer)


        let allTasks = await TaskContract.getMyTasks()
        setTasks(allTasks)
      }
    } catch (err) {
      console.error(err)
    }

  }
  // Add tasks from front-end onto the blockchain
  const addTask = async (e) => {
    e.preventDefault()
    let task = {
      isDeleted: false,
      taskText: input
    }

    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(TaskContractAddress, TaskAbi.abi, signer)

        console.log(task.taskText)
        TaskContract.addTask(task.taskText, task.isDeleted).then(res => {
          setTasks((prev) => [...prev, task])
          console.log("Added task")
        }).catch(err => { throw err })
      }
    } catch (err) {
      console.error(err)
    }

    setInput("")
  }

  // Remove tasks from front-end by filtering it out on our "back-end" / blockchain smart contract
  const deleteTask = async (key) => {
    console.log("delete task", key)

    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(TaskContractAddress, TaskAbi.abi, signer)

        TaskContract.deleteTask(key).then(res => {

          setTasks((prev) => prev.filter(task => task.id != key))
          console.log("removed task")
        }).catch(err => { throw err })
      }
    } catch (err) {
      console.error(err)
    }

  }

  return (
    <div className='bg-[#97b5fe] h-screen w-screen flex justify-center py-6'>
      {!isUserLoggedIn ? <ConnectWalletButton connectWallet={connectWallet} /> :
        correctNetwork ? <TodoList setInput={setInput} addTask={addTask} deleteTask={deleteTask} tasks={tasks} input={input} /> : <WrongNetworkMessage />}
    </div>
  )
}

