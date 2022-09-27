// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TaskContract {
 

  event AddTask(address receipient, uint taskId );
  event DeleteTask(uint taskId, bool isDeleted);

  struct Task{
    uint id; string taskText; bool isDeleted;
  }

  Task[] private tasks;

  mapping(uint256=>address) taskToOwner;


  function addTask(string memory taskText, bool isDeleted) external {
    uint taskId=tasks.length;
    tasks.push(Task(taskId, taskText, isDeleted));
    taskToOwner[taskId]=msg.sender;
    emit AddTask(msg.sender, taskId);
  }

  // get tasks that are mine and not yet deleted
  function getMyTasks()external view returns(Task[] memory){
    Task[] memory temporary = new Task[](tasks.length);
    uint counter=0;


    for(uint i=0; i<tasks.length; i++){
      if(taskToOwner[i]== msg.sender && tasks[i].isDeleted==false){
        temporary[counter]= tasks[i];
        counter+=1;
        
      }
    }

    Task[] memory result= new Task[](counter);

    for(uint i=0; i<result.length;i++){
      result[i]= temporary[i];
    }


      return result;
    }

    function deleteTask(uint taskId)external{
      if(taskToOwner[taskId]==msg.sender){
        tasks[taskId].isDeleted = true;
        emit DeleteTask(taskId, true);
      }
    }

  
}