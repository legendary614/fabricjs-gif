import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import {FileUploadModule} from 'ng2-file-upload';
import { AssetService } from './asset.service';


import { AppComponent } from './app.component';
import { SocketService } from './shared/services/socket.service';
import { Gif2spriteService } from './shared/services/gif2sprite.service';

import { Ng5FilesModule } from '../app/shared/module/ng5-files';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FileUploadModule,
    AppRoutingModule,
    Ng5FilesModule
  ],
  providers: [
    AssetService,
    SocketService,
    Gif2spriteService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
