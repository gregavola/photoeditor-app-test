import { Component, NgZone } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { Camera } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';

declare var PESDK;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  finalPhoto: string = '';

  readonly defaultOptions = {
    quality: 90,
    sourceType: this.camera.PictureSourceType.CAMERA,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    targetWidth: 2000,
    targetHeight: 2000,
    correctOrientation: true
  };

  constructor(public navCtrl: NavController,
              public camera: Camera,
              public imagePicker: ImagePicker,
              public platform: Platform,
              public file: File,
              public filePath: FilePath,
              public zone: NgZone) {

  }

  handleFileImage(img: string) {
    if (this.platform.is('cordova')) {
      if (this.platform.is('ios')) {
        const parseImg = img.indexOf('file:///') !== -1 ? img.replace('file://', '') : img;
        return parseImg;
      } else {
        return img;
      }
    }

  }

  removePhoto(img) {
    if (this.platform.is('ios')) {
      img = `file://${img}`;
    }

    const fileName = img.split("/");
    console.log(`path ${img}`);
    console.log(`filename ${fileName[fileName.length-1]}`);
    this.file.resolveLocalFilesystemUrl(img)
    .then((fileEntry) => {

      console.log(fileEntry);
      fileEntry.remove(
        () => {
          console.log("file deleted");
        },
        (error) => {
          console.log(error);
        }
      )
    })
    .catch((err) => {
      console.log(err);
    })
  }

  presentEdit(photoPath: string) {
    PESDK.present(
      // success
      (result) => {
        console.log(result);
        const returnPhotoUrl = result.url;
        console.log(returnPhotoUrl);
        this.zone.run(() => {
          this.finalPhoto = this.handleFileImage(returnPhotoUrl);
          console.log(this.finalPhoto);
        })

      },
      // failure
      (error) => {
        alert(`PESDK error: ${error}`);
      },
      {
        sourceType: 1,
        path: photoPath,
        shouldSave: false
      }
     )
  }

  takePhoto() {
    this.camera.getPicture(this.defaultOptions).then(
      imageUrl => {

        if (this.platform.is('android')) {
          this.filePath
            .resolveNativePath(imageUrl)
            .then(filePath => {
              this.presentEdit(filePath);
            })
            .catch(err => {
              console.error(err);
            });
        } else {
          this.presentEdit(this.handleFileImage(imageUrl));
        }
      },
      err => {
        console.log(err);
      }
    );
  }

}
