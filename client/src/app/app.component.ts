import { Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, ParamMap} from '@angular/router';
import { HttpClient, HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http'

import { Injectable } from '@angular/core';
import {AssetService} from './asset.service';
import { ngfModule, ngf } from "angular-file";
import { Subscription } from 'rxjs'
import { FileUploader } from 'ng2-file-upload';
// import { string as template } from "./app.template"

@Component({
  selector: 'app-root',
  // template : template,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ AssetService ]

})
export class AppComponent implements OnInit {
  title = 'app';

  public uploader: FileUploader = new FileUploader({ url: 'http://192.168.1.10/generate.com/index.php' });
  constructor(private _assetService: AssetService) {}

  ngOnInit() {

    this._assetService.loadScript('/assets/js/fabric.js').then(data => {
      console.log(data); // {loaded: true, status: 'Loaded'}
    }); 
    this._assetService.loadScript('/assets/js/common.js').then(data => {
      console.log(data); // {loaded: true, status: 'Loaded'}
    });

    this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
      window.localStorage.setItem("count", response);
    };

    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCancelItem = (item:any, response: any, status: any, header:any) => {

      console.log('ImageUpload:uploaded:', item, status, response);

    }
  }

  view()
  {
  }

}
