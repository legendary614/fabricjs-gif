import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { HttpClient, HttpRequest, HttpResponse, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { AssetService } from './asset.service';
import { Gif2spriteService } from './shared/services/gif2sprite.service';
import { Ng5FilesStatus, Ng5FilesSelected, Ng5FilesConfig, Ng5FilesService } from '../app/shared/module/ng5-files';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AssetService]

})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private _assetService: AssetService, private socket: Gif2spriteService) { }

  private fileUploadConfig: Ng5FilesConfig = {
    // acceptExtensions: ['png', 'jpg', 'jpeg', 'JPEG', 'JPG'],
    acceptExtensions: ['png', 'PNG', 'gif', 'GIF'],
    maxFilesCount: 5,
    maxFileSize: 5120000,
    totalFilesSize: 10120000
  };
  public props_upload: any = {
    selectedFiles: null,
    uploadedFiles: []
  };
  image: any;
  file:File = null;
  canvas:any;

  public $uns = [];
  public uploadedAzureFileName = null;

  ngOnInit() {
    this.$uns.push(this.socket.onGenerateSas.subscribe((message) => {
      if (this.uploadedAzureFileName != null) {
        this.downloadFile(this.uploadedAzureFileName + '?' + message.message.token);
      }
    }));

    this.$uns.push(this.socket.onUpload.subscribe((message) => {
      this.uploadedAzureFileName = message.cloudPath;
    }));

  }
  view() {
    this.socket._copy('message');
  }
  filesSelect(selectedFiles: Ng5FilesSelected): void {
    if (selectedFiles.status !== Ng5FilesStatus.STATUS_SUCCESS) {
        this.props_upload.selectedFiles = selectedFiles.status;
    }
    this.props_upload.selectedFiles = Array.from(selectedFiles.files);
    for (let i = 0; i < this.props_upload.selectedFiles.length; i ++) {
      const file = this.props_upload.selectedFiles[i];
      console.log(file);
      // if (ext === '.jpg' || ext === '.png' || ext === '.jpeg') {
      if (!file.$error) {
        this.socket._upload(file, { guid: this.socket.fakeId() });
      }
    }
  }
  download() {
    this.socket._generateSas();
    // this.socket._download('message');
  }

  downloadFile(src) {
    const element = document.createElement('a');
    element.setAttribute('href', src);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

}
