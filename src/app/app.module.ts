import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent, AppRoutingModule } from './app.component';
import { Version } from './version';
@NgModule({
  declarations: [
    AppComponent, Version
  ],
  imports: [
    BrowserModule, FormsModule, AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent, Version, ]
})
export class AppModule { }


