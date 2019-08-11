## API SCHEMA

This React Component recieves data from a REST API from an endpoint. The response from the API is stored in the component's state dashboard_data.

https://sitefreq-admin-interface.azurewebsites.net/api/dashboard_endpoint?code=cn4aTW8t4vp5657hV7M318umPV0ggNsCRyaAAW66v0LTz8qxVkxBFg==&adminID=002a254e-27e0-408e-8a4d-471dce282ee7&domain=company.frequency.nz&timeStamp=2018-08-08

The parameters for the endpoint are: 

* Code - This is a static value required to access the API
* adminID - This is the adminID that is returned when the user is logged in
* domain - This determines which company is accessing the API
* timeStamp - This is a date string in the format (YYYY-mm-dd) that makes it easier for the API to  relevant information

The schema of the response from the endpoint looks like this :

```
{
    listOfProjects : [
        {
            projectID: String,
            projectName: String,
            projectDescription: String
        }
    ],
    numberOfClockedInPersonnel : [
        {
            date: String,
            clockedInPersonnel: [
                {
                    projectID: String,
                    numberOnSite: Int
                }
            ]//If no clocked in personnel are present it returns null
        }
    ],
    broadcastWidgetData : [
        {
            projectID: String,
            broadcastData : {
                    broadcastID: String,
                    broadcastTitle: String,
                    numberOfPeopleRead: Int
            } //If no broadcast has been sent. broadcastData is null
        }
    ],
    ssspWidgetData : [
        {
            projectID: String,
            ssspData: {
                docID: String,
                docName: String,
                lastModifiedOn: String,
                numberOfPeopleRead: Int
            } //Returns null if no SSSP data is present
        }
    ],
    numberOfPeopleOnSiteData: [
        {
            projectID: String,
            today: Int,
            yesterday: Int
        }
    ],
    numberOfEntitiesData : [
        {
            projectID: String,
            entityData: {
                numberOfSubcontractors: Int,
                numberOfClients: Int,
                numberOfConsultants: Int
            }
        }
    ],
    staffDistributionByCompany:[
        {
            companyName: String,
            companyID: String,
            totalNumberOfDistinctStaff: Int
            staffDistributionByProject : [
                numberOfStaff: Int,
                projectID: String
            ]
        }
    ],
    numberOfHoursByCompany: [
        {
            projectID: String,
            companyTimeData: [
                {
                    companyID: String,
                    companyName: String,
                    companyType: String,
                    numberOfHours: Int
                }
            ] // Returns null if no company data is present for a project
        }
    ]
}
```
