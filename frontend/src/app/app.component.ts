import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ChatService } from './services/chat/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('popup', {static: false}) popup: any;

  public roomId: string;
  public messageText: string;
  public messageArray: { name: string, message: string }[] = [];
  private storageArray = [];

  public showScreen = false;
  public currentUser;
  public selectedUser;

  public userList = [
    {
      id: 1,
      name: 'john',
      roomId: {
        2: 'room-1',
        3: 'room-2',
      }
    },
    {
      id: 2,
      name: 'pallavi',
      roomId: {
        1: 'room-1',
        3: 'room-4',
      }
    },
    {
      id: 3,
      name: 'mark',
      image: 'assets/user/user-3.png',
      roomId: {
        1: 'room-2',
        2: 'room-4',
      }
    }
  ];
  name: any;

  constructor(
    private modalService: NgbModal,
    private chatService: ChatService
  ) {
  }

  ngOnInit(): void {
    this.chatService.getMessage().subscribe((data: { name: string, room: string, message: string }) => {
        if (this.roomId) {
          setTimeout(() => {
            this.storageArray = this.chatService.getStorage();
            const storeIndex = this.storageArray.findIndex((storage) => storage.roomId === this.roomId);
            this.messageArray = this.storageArray[storeIndex].chats;
          }, 500);
        }
      });
  }

  ngAfterViewInit(): void {
    this.openPopup(this.popup);
  }

  openPopup(content: any): void {
    this.modalService.open(content, {backdrop: 'static', centered: true});
  }

  login(dismiss: any): void {
    this.currentUser = this.userList.find(user => user.name === this.name.toString());
    this.userList = this.userList.filter((user) => user.name !== this.name.toString());
    if (this.currentUser) {
      this.showScreen = true;
      dismiss();
    }
  }

  selectUserHandler(name: string): void {
    this.selectedUser = this.userList.find(user => user.name === name);
    this.roomId = this.selectedUser.roomId[this.currentUser.id];    
    this.messageArray = [];
    this.storageArray = this.chatService.getStorage();
    const storeIndex = this.storageArray.findIndex((storage) => storage.roomId === this.roomId);
    if (storeIndex > -1) {
      this.messageArray = this.storageArray[storeIndex].chats;
    }
    this.join(this.currentUser.name, this.roomId);
  }

  join(username: string, roomId: string): void {
    this.chatService.joinRoom({name: username, room: roomId});
  }

  sendMessage(): void {
    this.chatService.sendMessage({
      name: this.currentUser.name,
      room: this.roomId,
      message: this.messageText
    });

    this.storageArray = this.chatService.getStorage();
    const storeIndex = this.storageArray.findIndex((storage) => storage.roomId === this.roomId);

    if (storeIndex > -1) {
      this.storageArray[storeIndex].chats.push({
        name: this.currentUser.name,
        message: this.messageText
      });
    } else {
      const updateStorage = {
        roomId: this.roomId,
        chats: [{
          name: this.currentUser.name,
          message: this.messageText
        }]
      };

      this.storageArray.push(updateStorage);
    }
    this.chatService.setStorage(this.storageArray);
    this.messageText = '';
  }

}
