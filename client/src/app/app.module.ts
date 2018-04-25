import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import {FileUploadModule} from 'ng2-file-upload';
import { AssetService } from './asset.service';


import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FileUploadModule,
    AppRoutingModule

  ],
  providers: [AssetService],
  bootstrap: [AppComponent]
})
export class AppModule { }
