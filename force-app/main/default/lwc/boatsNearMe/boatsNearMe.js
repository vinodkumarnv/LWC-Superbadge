import { LightningElement, wire, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';

// imports
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
    @api boatTypeId;
    mapMarkers = [];
    isLoading = true;
    isRendered = false;
    latitude;
    longitude;
    
    // Add the wired method from the Apex Class
    // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
    // Handle the result and calls createMapMarkers
    @wire(getBoatsByLocation, { latitude: '$latitude', longitude: '$longitude', Id: '$boatTypeId' })
    wiredBoatsJSON({error, data}) {
        if (data) 
        {
            createMapMarkers(JSON.parse(data));
            isLoading = false;
        } 
        else if (error) 
        {
            const evt = new ShowToastEvent({
                variant: ERROR_VARIANT,
                title: ERROR_TITLE,
            });
            this.dispatchEvent(evt);
            isLoading = false;
        }
    }
    
    // Controls the isRendered property
    // Calls getLocationFromBrowser()
    renderedCallback() 
    {
        if (this.isRendered) {
            return;
        }
        this.isRendered = true;
        this.getLocationFromBrowser();
    }
    
    // Gets the location from the Browser
    // position => {latitude and longitude}
    getLocationFromBrowser() 
    { 
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    this.latitude = position.coords.latitude;
                    this.longitude= position.coords.longitude;
                }
            );
        }
        else {
            alert("Sorry, browser does not support geolocation!");
        }
    }
    
    // Creates the map markers
    createMapMarkers(boatData) {
        // const newMarkers = boatData.map(boat => {...});
        // newMarkers.unshift({...});
        const newMarkers = boatData.map((boat) => 
        {
            return {
                title : boat.Name,
                location : {
                    Latitude : boat.Geolocation__Latitude__s,
                    Longitude : boat.Geolocation__Longitude__s
                }
            }
        });
        newMarkers.unshift({
            title : LABEL_YOU_ARE_HERE,
            icon : ICON_STANDARD_USER,
            location : {
                Latitude : this.latitude,
                Longitude : this.longitude
            }
        });
        
        this.mapMarkers = newMarkers;
        this.isLoading = false;
    }
}
