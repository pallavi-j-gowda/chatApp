import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  ChatService
} from './services/chat/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('popup', {
    static: false
  }) popup: any;

  public roomId: string;
  public messageText: string;
  public messageArray: {
    name: string,
    message: string
  } [] = [];
  private storageArray = [];

  public showScreen = false;
  public currentUser;
  public selectedUser;

  name: any;
  userList: any;
  userName: any;
  updatedUserList: any;
  msgData: any;

  constructor(
    private modalService: NgbModal,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.chatService.getUserData().subscribe((res) => {
      this.userList = res.response
    })
 
  }

  ngAfterViewInit(): void {
    this.openPopup(this.popup);
  }

  openPopup(content: any): void {
    this.modalService.open(content, {
      backdrop: 'static',
      centered: true
    });
  }

  login(dismiss: any): void {
    this.currentUser = this.userList.find(user => user.userName === this.userName);
    this.userList = this.userList.filter(user => user.userName !== this.userName);
    if (this.currentUser) {
      this.showScreen = true;
      dismiss();
    }
  }

  defineUserDetails(id, value) {
    let userObj = {}
    userObj[id] = value;
    return userObj
  }

  selectUserHandler(userName: string): void {
    this.selectedUser = this.userList.find(user => user.userName === userName);
    let data = this.defineUserDetails(this.selectedUser._id, this.selectedUser.email);
    let requestBodyData = {
      roomid: data,
      ids: [this.currentUser._id, this.selectedUser._id]
    }

    this.chatService.updateUserData(requestBodyData).subscribe((res) => {
    })
    this.roomId = this.selectedUser.roomId[this.currentUser._id];
    this.messageArray = [];
    this.join(this.currentUser.name, this.roomId);
    this.getChatMsg()
  }

  join(username: string, roomId: string): void {
    this.chatService.joinRoom({
      name: username,
      room: roomId
    });
  }
getChatMsg(){
  console.log(this.currentUser.chartId,'this.currentUser.chartId');
  
  this.chatService.getChatData(this.selectedUser.chartId).subscribe((res)=>{
    this.msgData=res.response     
  })
}
  sendMessage(): void {
    this.chatService.sendMessage({
      name: this.currentUser.userName,
      room: this.currentUser.email,
      message: this.messageText
    });
   
    let chartId = [
      this.currentUser._id,
      this.selectedUser._id
    ];
    const updateStorage = {
      userId:chartId,
      chats: [{
        roomId:this.selectedUser.email,
        name: this.currentUser.userName,
        message: this.messageText
      }]
    };
    this.chatService.addChatData(updateStorage).subscribe(res => {
      this.getChatMsg()
      })
     
    
    this.messageText = '';
  }

}