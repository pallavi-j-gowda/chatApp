import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private socket: Socket;
  private url = 'http://localhost:3000'; // your server local path

  constructor(private http:HttpClient) {
    this.socket = io(this.url, {transports: ['websocket', 'polling', 'flashsocket']});
  }

  joinRoom(data): void {
    this.socket.emit('join', data);
  }

  sendMessage(data): void {
    console.log(data);
    
    this.socket.emit('message', data);
  }

  getMessage(): Observable<any> {
    return new Observable<{user: string, message: string}>(observer => {
      this.socket.on('new message', (data) => {
        observer.next(data);
      });

      return () => {
        this.socket.disconnect();
      }
    });
  }

 

  setStorage(data) {
    localStorage.setItem('chats', JSON.stringify(data));
  }
  getChatData(userId){
    return this.http.get<{ error: boolean, message: string,response:any; }>(`http://localhost:3000/chat/${userId}`);
  }
  getUserData(){
    return this.http.get<{ error: boolean, message: string,response:any; }>(`http://localhost:3000/get-user`);
  }
  addChatData(data){
    return this.http.post<{ error: boolean, message: string,response:any; }>(`http://localhost:3000/add-chat`,data);
  }
  updateUserData(data){
    return this.http.put<{ error: boolean, message: string,response:any; }>(`http://localhost:3000/update-user`,data);
  }
}
