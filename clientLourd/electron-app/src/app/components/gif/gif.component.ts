import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AuthenticationService } from "@app/services/authentication/authentication.service";
import { ChatService } from "@app/services/chat/chat.service";
import { CommunicationService } from "@app/services/communication/communication.service";
import { RoomService } from "@app/services/room/room.service";
import { BehaviorSubject } from "rxjs";
import { environment } from "src/environments/environment";

@Component({
    selector: "app-gif",
    templateUrl: "./gif.component.html",
    styleUrls: ["./gif.component.scss"],
})
export class GifComponent {
    private readonly apiKey: string = environment.tenorAPIKey;
    searchText = "";
    gifs: string[] = [];
    constructor(public dialogRef: MatDialogRef<GifComponent>, private chatService: ChatService, private roomService: RoomService) {
    }

    httpGetAsync(theUrl: string, callback: any)
    {
        // create the request object
        const xmlHttp = new XMLHttpRequest();
        const goodGifs = new BehaviorSubject<any>([]);
        goodGifs.subscribe((gifs) => {
            this.gifs = [];
            for (const gif of gifs)
                this.gifs.push(gif["media_formats"]["nanogif"]["url"]);
        });

        // set the state change callback to capture when the response comes in
        xmlHttp.onreadystatechange = function()
        {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            {
                const gifs = callback(xmlHttp.responseText);
                goodGifs.next(gifs);
            }
        }

        // open as a GET call, pass in the url and set async = True
        xmlHttp.open("GET", theUrl, true);

        // call send with no params as they were passed in on the url string
        xmlHttp.send(null);

        return;
    }

    // callback for the top 8 GIFs of search
    tenorCallback_search(responsetext: string)
    {
        // Parse the JSON response
        const response_objects = JSON.parse(responsetext);

        //console.log(this.gifs);

        //this.gifs = response_objects["results"];

        // load the GIFs -- for our example we will load the first GIFs preview size (nanogif) and share size (gif)
        /*for (let i = 0; i < this.gifs.length; i++) {
            document.getElementsByClassName("gif")[i].setAttribute("src", this.gifs[i]["media_formats"]["nanogif"]["url"]);
        }*/

        //document.getElementById("preview_gif")?.setAttribute("src", top_10_gifs[0]["media_formats"]["nanogif"]["url"]);

        //document.getElementById("share_gif").src = top_10_gifs[0]["media_formats"]["gif"]["url"];

        return response_objects["results"];

    }

    shared_gifs_id = "16989471141791455574";

    grab_data()
    {
        // set the apikey and limit
        const apikey = this.apiKey;
        const clientkey = "my_test_app";
        const lmt = 8;

        // test search term
        const search_term = "excited";

        console.log(this.searchText);
        // using default locale of en_US
        const search_url = "https://tenor.googleapis.com/v2/search?q=" + this.searchText + "&key=" + apikey +"&client_key=" + clientkey +  "&limit=" + lmt;
        //const share_url = "https://tenor.googleapis.com/v2/registershare?id=" + this.shared_gifs_id + "&key=" + apikey + "&client_key=" + clientkey + "&q=" + search_term;

        this.httpGetAsync(search_url,this.tenorCallback_search);

        // data will be loaded by each call's callback
        return;
    }

    submit(gif: string): void {
        this.chatService.send(gif, this.roomService.currentRoomChat.value);
        this.close();
    }

    close() {
        this.dialogRef.close();
    }
}