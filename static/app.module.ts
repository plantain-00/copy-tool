import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import { FileUploaderComponent } from "file-uploader-component/dist/angular";
import { AppComponent } from "./app.component";

@NgModule({
    imports: [BrowserModule, FormsModule],
    declarations: [AppComponent, FileUploaderComponent],
    bootstrap: [AppComponent],
})
export class AppModule { }
