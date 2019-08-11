import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// react plugin used to create charts
import { Line, Bar, Doughnut } from "react-chartjs-2";
//Importing Icons and loaders
import broadcast_icon from "assets/img/broadcast_icon.svg";
import documents_icon from "assets/img/documents_icon.svg";
import axios from 'axios';
import LoadingOverlay from 'react-loading-overlay';
import RingLoader from 'react-spinners/RingLoader';
import ReactBSAlert from "react-bootstrap-sweetalert";

// reactstrap components
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col
} from "reactstrap";

// core components
import {
  chartExample1,
  chartExample11,
  chartExample7
} from "variables/charts.jsx";

//Import React Select
import Select from "react-select";

let dateFormat = require('dateformat')

//This is the dashboard component
class Dashboard extends React.Component {

  /* 
  State Description
  
  bigChartData 
      => Changed By: Buttons indicating Week, Fortnight and Month
      => Accessed By: The First Giant Bar Chart data in SiteCheck
  isLoading
      => Changed By: Network Access in componentDidMount()
      => Accessed By: The Loading Overlay
  dashboard_data
      => Changed By: Successful Response from network call in componentDidMount
      => Accessed By: Every component on the screen, as it holds the data sent from the REST API
  
  alert
      => Changed By : Negative response from network call in componentDidMount
      => Accessed By : The alert dialog component in the layout
  projectSelected
    => Changed By: The Select component
    => Accessed By: Every component in the dashboard UI
  
  
  */
  constructor(props) {
    super(props);
    this.state = {
      bigChartData: 'week',
      isLoading: true,
      dashboard_data: {},
      alert: null,
      projectSelected: 'all'
    };
  }

  setBgChartData = name => {
    this.setState({
      bigChartData: name
    });
  };

  setIsLoading = value => {
    this.setState({ isLoading: value });
  };

  setDashboardData = value => {
    this.setState({ dashboard_data: value });
  };

  setProjectSelected = project => {
    this.setState({ projectSelected: project.value });
  };

  //Method To Show Alert
  basicAlert = message => {
    this.setState({
      alert: (
        <ReactBSAlert
          style={{ display: "block", marginTop: "-100px" }}
          title={message}
          onConfirm={() => this.hideAlertAndRefresh()}
          onCancel={() => this.hideAlertAndRefresh()}
          confirmBtnBsStyle="success"
          cancelBtnBsStyle="danger"
          confirmBtnText="Reload Page"
          cancelBtnText="Contact Support"
          btnSize=""
        />
      )
    });
  };

  hideAlert = () => {
    this.setState({
      alert: null
    });
  };

  hideAlertAndRefresh = () => {
    this.setState({
      alert: null
    });
    window.location.reload();
  };

  getProjectList = () => {

    let listOfOptions = [{
      value: 'all',
      label: "All Projects",
      isDisabled: false
    }]

    let listOfProjects = [];
    listOfProjects = this.state.dashboard_data.listOfProjects;

    //Checks if the network request is complete and dashboard_data is valid
    //Adds projectName and projectID to the listOfProjects Label
    if (listOfProjects !== undefined) {
      listOfProjects.forEach(element => {
        listOfOptions.push({
          value: element.projectID,
          label: element.projectName
        });
      });
    }

    return listOfOptions
  }

  //This generates the labels for the initial Line Chart - Returns list of dates in a meaningful format
  generateLabelsForClockedInPersonnelLineChart = (clockedInPersonnel) => {
    return clockedInPersonnel
      .map(function (entry) {
        let month = entry.date.slice(5, 7)
        let day = entry.date.slice(8, 10)
        return day + '-' + month
      });
  }



  /*
  
  This generates the data for the Initial Line Chart
  Parameters => clockedInPersonnel Object and projectSelected
  Returns => Array of with numberOnSite for each day
  */
  generateDataForClockedInPersonnelLineChart = (clockedInPersonnel, projectSelected) => {
    return clockedInPersonnel
      .map(function (entry) {
        if (entry.clockedInPersonnel !== null) {
          //There is some data
          if (projectSelected === 'all') {
            //This is for all projects - Return Sum of All number on site
            return entry.clockedInPersonnel.reduce(function (accumulator, clockedInEntry) {
              return accumulator + clockedInEntry.numberOnSite;
            }, 0);
          } else {
            //This is for a specific project - Filter it for that project
            let specificProjectData = entry.clockedInPersonnel.filter(function (entry) {
              return entry.projectID === projectSelected;
            });
            //Check if the project does not have any entries
            if (!Array.isArray(specificProjectData) || !specificProjectData.length) {
              return 0
            } else {
              //Return sum of numberOnSite
              return specificProjectData.reduce(function (accumulator, entry) {
                return accumulator + entry.numberOnSite
              }, 0);
            }
          }
        } else {
          //There is no data
          return 0;
        }
      });
  }

  /*
  This method return a line Chart - in accordance to ChartJS - 
  With Parameters -> labels, data and gradientStroke (from Canvas of ChartJS)
  */

  createLineChartWith = (labels, data, gradientStroke) => {
    return {
      labels: labels,
      datasets: [
        {
          label: "Number of People on Site",
          fill: true,
          backgroundColor: gradientStroke,
          borderColor: "#ff7b00",
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: "#ff7b00",
          pointBorderColor: "rgba(255,255,255,0)",
          pointHoverBackgroundColor: "#ff7b00",
          pointBorderWidth: 20,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
          data: data
        }
      ]
    };

  }

  //This returns the placeholderData While the network is loading
  getPlaceHolderData = (gradientStroke) => {
    return {
      labels: [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC"
      ],
      datasets: [
        {
          label: "Placeholder Data",
          fill: true,
          backgroundColor: gradientStroke,
          borderColor: "#ff7b00",
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: "#ff7b00",
          pointBorderColor: "rgba(255,255,255,0)",
          pointHoverBackgroundColor: "#ff7b00",
          pointBorderWidth: 20,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
          data: [100, 70, 90, 70, 85, 60, 75, 60, 90, 80, 110, 100]
        }
      ]
    }
  }

  /*  
  This returns the Line Chart Data - Method called from REACT Component
  */
  getLineChartData = (canvas) => {
    let ctx = canvas.getContext("2d");

    let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, "rgba(255,172,66,0.2)");
    gradientStroke.addColorStop(0.4, "rgba(255,172,66,0.0)");
    gradientStroke.addColorStop(0, "rgba(255,172,66,0)"); //orange colors

    //Checks if network load is complete and it holds data
    if (this.state.dashboard_data.numberOfClockedInPersonnel !== null || this.state.dashboard_data.numberOfClockedInPersonnel !== undefined) {
      //Assign it to local variables for easier access
      let numberOfClockedInPersonnel = []
      numberOfClockedInPersonnel = this.state.dashboard_data.numberOfClockedInPersonnel
      let projectSelected = this.state.projectSelected

      switch (this.state.bigChartData) {
        case 'month':
          let labelsForMonth = this.generateLabelsForClockedInPersonnelLineChart(numberOfClockedInPersonnel)

          let dataForMonth = this.generateDataForClockedInPersonnelLineChart(numberOfClockedInPersonnel, projectSelected)

          return this.createLineChartWith(labelsForMonth, dataForMonth, gradientStroke)

          
        case 'fortnight':
          //Filter the data for the fortnight
          let labelsForFortnight = this.generateLabelsForClockedInPersonnelLineChart(numberOfClockedInPersonnel
            .filter(function (entry) {
              let today = new Date()
              let dateInQuestion = new Date(entry.date)
              let differenceInDays = Math.floor((today - dateInQuestion) / 86400000)
              return differenceInDays <= 14
            })
          )

          let dataForFortnight = this.generateDataForClockedInPersonnelLineChart(numberOfClockedInPersonnel
            .filter(function (entry) {
              let today = new Date()
              let dateInQuestion = new Date(entry.date)
              let differenceInDays = Math.floor((today - dateInQuestion) / 86400000)
              return differenceInDays <= 14
            }),
            projectSelected)

          return this.createLineChartWith(labelsForFortnight, dataForFortnight, gradientStroke)

        default:
          //Filter the data for a week
          if (typeof numberOfClockedInPersonnel !== 'undefined') {
            let labelsForWeek = this.generateLabelsForClockedInPersonnelLineChart(
              numberOfClockedInPersonnel.filter(function (entry) {
                let today = new Date()
                let dateInQuestion = new Date(entry.date)
                let differenceInDays = Math.floor((today - dateInQuestion) / 86400000)
                return differenceInDays <= 7
              })
            )

            let dataForWeek = this.generateDataForClockedInPersonnelLineChart(numberOfClockedInPersonnel
              .filter(function (entry) {
                let today = new Date()
                let dateInQuestion = new Date(entry.date)
                let differenceInDays = Math.floor((today - dateInQuestion) / 86400000)
                return differenceInDays <= 7
              }),
              projectSelected)

            return this.createLineChartWith(labelsForWeek, dataForWeek, gradientStroke)

          }
          //This is placeholder data
          return this.getPlaceHolderData(gradientStroke)

      }
    }

  }

  //This method returns the number of people who read the broadcast
  getNumberOfPeopleWhoReadBroadcast = () => {
    //Check if the network access and we can access data
    if (typeof this.state.dashboard_data.broadcastWidgetData !== 'undefined') {
      //Assigning for easier access
      let broadcastWidgetData = []
      broadcastWidgetData = this.state.dashboard_data.broadcastWidgetData
      let projectSelected = this.state.projectSelected

      if (projectSelected === 'all') {
        //Returns the broadcast with the highest number of people read if all projects are selected
        let maximumValueInTheArray = broadcastWidgetData.reduce((max, entry) => Math.max(max, entry.broadcastData === null ? 0 : entry.broadcastData.numberOfPeopleRead), 0);
        return maximumValueInTheArray
      } else {
        //Filters the data for the project
        let specificProjectData = broadcastWidgetData.filter(function (entry) {
          return entry.projectID === projectSelected;
        });
        //Returns the number of people read for the latest broadcast
        let numberOfPeopleReadTheBroadcast = specificProjectData[0].broadcastData === null ? 0 : specificProjectData[0].broadcastData.numberOfPeopleRead;
        return numberOfPeopleReadTheBroadcast

      }
    }
    return 0

  }

  //Returns the broadcast with the highest number of read reciepts
  getTheHighestNumberReadForBroadcast = (broadcastList) => {
    return broadcastList.reduce((max, data) => max && (max.broadcastData === null ? 0 : max.broadcastData.numberOfPeopleRead) > (data.broadcastData === null ? 0 : data.broadcastData.numberOfPeopleRead) ? max : data, null)
  }

  //This return the title of the latest broadcast
  getTheTitleOfBroadcast = () => {
    //Check if network access complete and we have data
    if (typeof this.state.dashboard_data.broadcastWidgetData !== 'undefined') {
      //Assign for easier access
      let broadcastWidgetData = []
      broadcastWidgetData = this.state.dashboard_data.broadcastWidgetData
      let projectSelected = this.state.projectSelected

      if (projectSelected === 'all') {
        let broadcastWithHighestRead = this.getTheHighestNumberReadForBroadcast(broadcastWidgetData)
        if (broadcastWithHighestRead.broadcastData === null) {
          //There is no broadcast
          return "No Broadcast found"
        }
        return broadcastWithHighestRead.broadcastData.broadcastTitle
      } else {
        //This is for a specific project - filter the data 
        let broadcastWithHighestRead = this.getTheHighestNumberReadForBroadcast(
          broadcastWidgetData
          .filter(data => data.projectID === projectSelected)
        )
        if (broadcastWithHighestRead.broadcastData === null) {
          return "No Broadcast found"
        }
        return broadcastWithHighestRead.broadcastData.broadcastTitle
      }
    }
    return "No broadcast found"
  }


  //This method returns the number of people who have read the latest SSSP
  getTheNumberOfPeopleWhoReadTheSSSP = () => {
    if (typeof this.state.dashboard_data.ssspWidgetData !== 'undefined') {
      let ssspWidgetData = []
      ssspWidgetData = this.state.dashboard_data.ssspWidgetData
      let projectSelected = this.state.projectSelected

      if (projectSelected === 'all') {
        let maximumValueInTheArray = ssspWidgetData.reduce((max, entry) => Math.max(max, entry.ssspData === null ? 0 : entry.ssspData.numberOfPeopleRead), 0);
        return maximumValueInTheArray
      } else {
        //Filter the data for the specific project
        let specificProjectData = ssspWidgetData.filter(function (entry) {
          return entry.projectID === projectSelected;
        });
        let numberOfPeopleReadTheSSSP = specificProjectData[0].ssspData === null ? 0 : specificProjectData[0].ssspData.numberOfPeopleRead;
        return numberOfPeopleReadTheSSSP
      }
    }
    return 0
  }

  //This method return the SSSP with the highest number of read
  getHighestNumberReadForSSSP = (ssspList) => {
    return ssspList.reduce((max, data) => max && (max.ssspData === null ? 0 : max.ssspData.numberOfPeopleRead) > (data.ssspData === null ? 0 : data.ssspData.numberOfPeopleRead) ? max : data, null)
  }

  //This returns the NZ Date time format given a SQL Date Time string 
  getNZDateFromSQLTimeString = (string) => {
    let timeString = string.slice(0, 19).replace('T', ' ')
    let month = timeString.slice(0, 2)
    let day = timeString.slice(3, 5)
    let year = timeString.slice(6, 10)
    return day + '-' + month + '-' + year
  }
  
  //This method return the last Modified Date for the latest SSSP
  getTheLastModifiedForLatestSSSP = () => {
    if (typeof this.state.dashboard_data.ssspWidgetData !== 'undefined') {
      let ssspWidgetData = []
      ssspWidgetData = this.state.dashboard_data.ssspWidgetData
      let projectSelected = this.state.projectSelected

      if (projectSelected === 'all') {
        //If all projects are selected - return the SSSP with the highest number of read reciepts
        let ssspWithHighestRead = this.getHighestNumberReadForSSSP(ssspWidgetData)
        if (ssspWithHighestRead.ssspData === null) {
          //There is no document
          return "No Document Found"
        }
        return this.getNZDateFromSQLTimeString(ssspWithHighestRead.ssspData.lastModifiedOn)
      } else {
        //This is for a specific project - filter the data
        let ssspWithHighestRead = this.getHighestNumberReadForSSSP(ssspWidgetData.filter(data => data.projectID === projectSelected))

        if (ssspWithHighestRead.ssspData === null) {
          return "No Broadcast found"
        }
        return this.getNZDateFromSQLTimeString(ssspWithHighestRead.ssspData.lastModifiedOn)
      }
    }
    return "No SSSP Document Found"
  }

  //This method return the total number of people on site today
  getTotalNumberOfPeopleOnSiteToday = () => {
    if (typeof this.state.dashboard_data.numberOfPeopleOnSiteData !== 'undefined') {
      let numberOfPeopleOnSiteData = []
      numberOfPeopleOnSiteData = this.state.dashboard_data.numberOfPeopleOnSiteData
      let projectSelected = this.state.projectSelected

      if (projectSelected === 'all') {
        //Add up all the number of people on site today
        return numberOfPeopleOnSiteData.reduce((sum, entry) => sum + entry.today, 0);
      } else {
        //This is for a specific project
        let projectEntry = numberOfPeopleOnSiteData.filter(entry => entry.projectID === projectSelected);
        return projectEntry[0].today
      }

    }
    return 0
  }

  //This method return the total number of people on site yesterday
  getTotalNumberOfPeopleOnSiteYesterday = () => {
    if (typeof this.state.dashboard_data.numberOfPeopleOnSiteData !== 'undefined') {
      let numberOfPeopleOnSiteData = []
      numberOfPeopleOnSiteData = this.state.dashboard_data.numberOfPeopleOnSiteData
      let projectSelected = this.state.projectSelected

      if (projectSelected === 'all') {
        //Add up all the number of people on site yesterday
        return numberOfPeopleOnSiteData.reduce((sum, entry) => sum + entry.yesterday, 0);
      } else {
        //This is for a specific project
        let projectEntry = numberOfPeopleOnSiteData.filter(entry => entry.projectID === projectSelected);
        return projectEntry[0].yesterday
      }

    }
    return 0
  }
  
  //This method return the total number of subContractors
  getTotalNumberOfSubcontractors = () => {
    if (typeof this.state.dashboard_data.numberOfEntitiesData !== 'undefined') {
      let numberOfEntitiesData = []
      numberOfEntitiesData = this.state.dashboard_data.numberOfEntitiesData
      let projectSelected = this.state.projectSelected

      if (projectSelected === 'all') {
        //Add All the subcontractors
        return numberOfEntitiesData.reduce((sum, entry) => sum + entry.entityData.numberOfSubcontractors, 0);
      } else {
        //Just get the number of Subcontractors for a specific project
        let projectEntry = numberOfEntitiesData.filter(entry => entry.projectID === projectSelected);
        return projectEntry[0].entityData.numberOfSubcontractors
      }

    }
    return 0
  }

  //This returns the total number of consultants
  getTotalNumberOfConsultants = () => {
    if (typeof this.state.dashboard_data.numberOfEntitiesData !== 'undefined') {
      let numberOfEntitiesData = []
      numberOfEntitiesData = this.state.dashboard_data.numberOfEntitiesData
      let projectSelected = this.state.projectSelected

      if (projectSelected === 'all') {
        //Add All the subcontractors
        return numberOfEntitiesData.reduce((sum, entry) => sum + entry.entityData.numberOfConsultants, 0);
      } else {
        //Just get the number of Subcontractors for that projects
        let projectEntry = numberOfEntitiesData.filter(entry => entry.projectID === projectSelected);
        return projectEntry[0].entityData.numberOfConsultants
      }
    }
    return 0
  }

  //This method returns the total number of clients
  getTotalNumberOfClients = () => {
    if (typeof this.state.dashboard_data.numberOfEntitiesData !== 'undefined') {
      let numberOfEntitiesData = []
      numberOfEntitiesData = this.state.dashboard_data.numberOfEntitiesData
      let projectSelected = this.state.projectSelected

      if (projectSelected === 'all') {
        //Add All the subcontractors
        return numberOfEntitiesData.reduce((sum, entry) => sum + entry.entityData.numberOfClients, 0);
      } else {
        //Just get the number of Subcontractors for that projects
        let projectEntry = numberOfEntitiesData.filter(entry => entry.projectID === projectSelected);
        return projectEntry[0].entityData.numberOfClients
      }
    }
    return 0
  }

  //Returns the total number of companies
  getTotalNumberOfCompanies = () => {
    if (typeof this.state.dashboard_data.staffDistributionByCompany !== 'undefined') {
      let staffDistributionByCompany = []
      staffDistributionByCompany = this.state.dashboard_data.staffDistributionByCompany
      let projectSelected = this.state.projectSelected

      if (projectSelected === 'all') {
        return staffDistributionByCompany.length
      } else {
        //This is for a specific project
        let numberOfCompaniesForProject = staffDistributionByCompany
          //Map it to staff distribution for project
          .map(entry => entry.staffDistributionByProject
            //Filter the entries with projectID as projectSelected and number Of staff is atleast 1
            .filter(subEntry => subEntry.projectID === projectSelected && subEntry.numberOfStaff > 0)
          )
          //Make the two dimensional array into a single one
          .reduce((prev, next) => prev.concat(next))
          .length
        return numberOfCompaniesForProject
      }
    }
    return 0
  }

  //This returns the placeholder for doughnut data
  getPlaceHolderDoughnutData = () => {
    return {
      labels: ["Company A", "Company B", "Company C"],
      datasets: [
        {
          label: "Placeholder data",
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: ["#ff8779", "#2a84e9", "#e2e2e2"],
          borderWidth: 0,
          data: [60, 40, 20]
        }
      ]
    };
  }

  //Generate a random color array
  generateRandomColorArray = (number) => {
    //Showing the existing brandColors
    let preDeterminedColorArray = ['#ff7b00', '#bbbbbb', '#2a84e9', '#d83a3a', '#ffac42', '#ec407a', '#ab47bc', '#673ab7', '#3949ab', '#fbc02d']
    if (number <= preDeterminedColorArray.length) {
      return preDeterminedColorArray.slice(0, number)
    }
    //This is more than the predetermined Color Array Size
    let remainingNumbers = number - preDeterminedColorArray.length

    //Create a random color array
    let colorArray = ["#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); })]
    if (remainingNumbers > 1) {
      for (let i = 1; i < number - preDeterminedColorArray.length; i++) {
        colorArray.push("#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); }));
      }
    }
    return preDeterminedColorArray.concat(colorArray)
  }

  //This returns the Doughnut Chart Data with given labels, data and array of background color
  createDoughnutChartDataWith = (labels, data, backgroundColor) => {
    return {
      labels: labels,
      datasets: [
        {
          label: "Number of Staff",
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: backgroundColor,
          borderWidth: 0,
          data: data
        }
      ]
    };
  }


  //This returns the doughnut chart data
  getDoughnutChartData = (canvas) => {

    if (typeof this.state.dashboard_data.staffDistributionByCompany !== 'undefined') {

      let staffDistributionByCompany = []
      staffDistributionByCompany = this.state.dashboard_data.staffDistributionByCompany
      let projectSelected = this.state.projectSelected

      if (projectSelected === 'all') {
        //This returns the company Names
        let labels = staffDistributionByCompany.map(entry => entry.companyName)
        //This returns the total number of distinct staff for each company
        let data = staffDistributionByCompany.map(entry => entry.totalNumberOfDistinctStaff)

        let backgroundColor = this.generateRandomColorArray(data.length)

        return this.createDoughnutChartDataWith(labels, data, backgroundColor)

      } else {

        //This returns the company names for a specific project and have at least one staff working on the site
        let labelCompanyNames = staffDistributionByCompany
        .reduce((names, entry) => {
          if (entry.staffDistributionByProject
            .filter(subEntry => subEntry.projectID === projectSelected)
            .filter(subEntry => subEntry.numberOfStaff > 0)
            .length >= 1
          ) {
            names.push(entry.companyName);
          }
          return names;
        }, []);

        //This returns number of staff for the selected project for each company with atleast one employee on site
        let dataForCompanyNames = staffDistributionByCompany
          .map(entry => entry.staffDistributionByProject
            .filter(subEntry => subEntry.projectID === projectSelected)
            .filter(subEntry => subEntry.numberOfStaff > 0)
            .map(anotherEntry => anotherEntry.numberOfStaff)
          )
          .reduce((prev, next) => prev.concat(next))

        let backgroundColor = this.generateRandomColorArray(dataForCompanyNames.length)

        return this.createDoughnutChartDataWith(labelCompanyNames, dataForCompanyNames, backgroundColor)

      }

    }

    return this.getPlaceHolderDoughnutData()
  }

  //This method returns the total number of hours worked by all companies
  getTotalNumberOfHoursWorkedByAllCompanies = () => {

    if (typeof this.state.dashboard_data.numberOfHoursByCompany !== 'undefined') {
      let numberOfHoursByCompany = []
      numberOfHoursByCompany = this.state.dashboard_data.numberOfHoursByCompany
      let projectSelected = this.state.projectSelected

      if (projectSelected === 'all') {
        //This returns the total number of hours spent by all companies spent on all site
        let totalNumberOfHours = numberOfHoursByCompany
          .map(subEntry => subEntry.companyTimeData)
          //Converting two dimensional array into a single one
          .reduce((prev, next) => {
            if (prev !== null && next !== null) {
              return prev.concat(next)
            }
            return prev
          }, [])
          //This returns the sum of number of hours in all entries
          .reduce((acc, entry) => acc + entry.numberOfHours, 0)

        return totalNumberOfHours.toFixed(2);

      } else {
        //This returns the total number of hours by company for a specific project
        let totalNumberOfHours = numberOfHoursByCompany
          .filter(entry => entry.companyTimeData !== null && entry.projectID === projectSelected)
          .map(subEntry => subEntry.companyTimeData)
          .reduce((prev, next) => {
            if (prev !== null && next !== null) {
              return prev.concat(next)
            }
            return prev
          }, [])
          .reduce((acc, entry) => acc + entry.numberOfHours, 0)

        return totalNumberOfHours.toFixed(2);
      }

    }
    return 0

  }

  //This returns the placeholder bar chart data 
  getPlaceHolderBarChartData = (canvas) => {
    let ctx = canvas.getContext("2d");
    let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, "rgba(255,173,66,0.3)");
    gradientStroke.addColorStop(0, "rgba(255,123,0,0)"); //blue colors
    return {
      labels: ["JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
      datasets: [
        {
          label: "Data",
          fill: true,
          backgroundColor: gradientStroke,
          hoverBackgroundColor: gradientStroke,
          borderColor: "#ff7b00",
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          data: [80, 100, 70, 80, 120, 80]
        }
      ]
    };
  }

  //This creates bar chart data with canvas, data and labels
  createBarChartWith = (canvas, data, labels) => {

    let ctx = canvas.getContext("2d");
    let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, "rgba(255,173,66,0.3)");
    gradientStroke.addColorStop(0, "rgba(255,123,0,0)"); //orange
    return {
      labels: labels,
      datasets: [
        {
          label: "Data",
          fill: true,
          backgroundColor: gradientStroke,
          hoverBackgroundColor: gradientStroke,
          borderColor: "#ff7b00",
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          data: data
        }
      ]
    }

  }

  //This method returns the data for bar chart and is called from the React component.
  getBarChartData = (canvas) => {

    if (typeof this.state.dashboard_data.numberOfHoursByCompany !== 'undefined') {
      let numberOfHoursByCompany = []
      numberOfHoursByCompany = this.state.dashboard_data.numberOfHoursByCompany
      let projectSelected = this.state.projectSelected

      if (projectSelected === 'all') {
        //This returns the company time data for all projects
        let hoursDistributionOnSite = numberOfHoursByCompany
          .map(subEntry => subEntry.companyTimeData)
          .reduce((prev, next) => {
            if (prev !== null && next !== null) {
              return prev.concat(next)
            }
            return prev
          }, [])

        let data = []
        let labels = []

        hoursDistributionOnSite.forEach(function (entry, index) {
          //If it is from the same company add, keep adding to the same data entry
          if (labels.includes(entry.companyName)) {
            //Check if the atleast one entry has been created in data
            if (data.length >= 1) {
              data[data.length - 1] += entry.numberOfHours
            }
          } else {
            //Labels have companyName and data has number of hours
            labels.push(entry.companyName)
            data.push(entry.numberOfHours)
          }
        })
        
        //Create bar chart data with canvas, data and labels
        return this.createBarChartWith(canvas, data, labels)

      } else {

        //Filter the data for the specific project 
        let hoursDistributionOnSite = numberOfHoursByCompany
          .filter(entry => entry.projectID === projectSelected)
          .map(subEntry => subEntry.companyTimeData)
          .reduce((prev, next) => {
            if (prev !== null && next !== null) {
              return prev.concat(next)
            }
            return prev
          }, [])

        let data = []
        let labels = []

        
        hoursDistributionOnSite.forEach(function (entry, index) {
          //If it is from the same company add, keep adding to the same data entry
          if (labels.includes(entry.companyName)) {
            if (data.length >= 1) {
              data[data.length - 1] += entry.numberOfHours
            }
          } else {
            //Labels have companyName and data has number of hours
            labels.push(entry.companyName)
            data.push(entry.numberOfHours)
          }
        })

        //Create bar chart data with canvas, data and labels
        return this.createBarChartWith(canvas, data, labels)

      }
    }
    return this.getPlaceHolderBarChartData(canvas)

  }
  
  componentDidMount() {
    //Get the data from the rest API
    axios.get('https://sitefreq-admin-interface.azurewebsites.net/api/dashboard_endpoint?code=cn4aTW8t4vp5657hV7M318umPV0ggNsCRyaAAW66v0LTz8qxVkxBFg%3D%3D',
      {
        params: {
          adminID: '002a254e-27e0-408e-8a4d-471dce282ee7',
          domain: 'company.frequency.nz',
          timeStamp: dateFormat(new Date(), "yyyy-mm-dd")
        }
      }).then(res => {
        this.setDashboardData(res.data)
        this.setIsLoading(false)
      }).catch(error => {
        this.setIsLoading(false)
        //Bring in an alert to show the failed message
        this.basicAlert("Could not retrieve data from the server. Please try again later")
        
        console.log(error)
      });
  }

  render() {
    return (
      <>
        <div className="content">
          <LoadingOverlay
            active={this.state.isLoading}
            spinner={<RingLoader color="#ff7b00" size="300"
            />}
            text='Loading...'
          >
            {this.state.alert}
            <Row>
              <Col sm={{ size: 3, offset: 9 }}>
                <Select
                  className="react-select primary"
                  classNamePrefix="react-select"
                  name="singleSelect"
                  onChange={value => this.setProjectSelected(value)}
                  options={this.getProjectList()}
                  placeholder="All Projects"
                />
              </Col>
            </Row>
            <br></br>
            <Row>
              <Col xs="12">
                <Card className="card-chart">
                  <CardHeader>
                    <Row>
                      <Col className="text-left" sm="6">
                        <h5 className="card-category">Clocked In</h5>
                        <CardTitle tag="h2">Personnel</CardTitle>
                      </Col>
                      <Col sm="6">
                        <ButtonGroup
                          className="btn-group-toggle float-right"
                          data-toggle="buttons"
                        >
                          <Button
                            color="primary"
                            id="0"
                            size="sm"
                            tag="label"
                            className={classNames("btn-simple", {
                              active: this.state.bigChartData === "week"
                            })}
                            onClick={() => this.setBgChartData("week")}
                          >
                            <input defaultChecked name="options" type="radio" />
                            <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                              Last Week
                          </span>
                            <span className="d-block d-sm-none">
                              <i className="tim-icons icon-watch-time" />
                            </span>
                          </Button>
                          <Button
                            color="primary"
                            id="1"
                            size="sm"
                            tag="label"
                            className={classNames("btn-simple", {
                              active: this.state.bigChartData === "fortnight"
                            })}
                            onClick={() => this.setBgChartData("fortnight")}
                          >
                            <input name="options" type="radio" />
                            <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                              Fortnight
                          </span>
                            <span className="d-block d-sm-none">
                              <i className="tim-icons icon-app" />
                            </span>
                          </Button>
                          <Button
                            color="primary"
                            id="2"
                            size="sm"
                            tag="label"
                            className={classNames("btn-simple", {
                              active: this.state.bigChartData === "month"
                            })}
                            onClick={() => this.setBgChartData("month")}
                          >
                            <input name="options" type="radio" />
                            <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                              Month
                          </span>
                            <span className="d-block d-sm-none">
                              <i className="tim-icons icon-calendar-60" />
                            </span>
                          </Button>
                        </ButtonGroup>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <div className="chart-area">
                      <Line
                        data={this.getLineChartData}
                        options={chartExample1.options}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="3" md="6">
                <Card className="card-stats">
                  <CardBody>
                    <Row>
                      <Col xs="5">
                        <div className="info-icon text-center icon-warning">
                          <img src={broadcast_icon} alt="Broadcast Icon" />
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Last Broadcast Read By</p>
                          <CardTitle tag="h3">{this.getNumberOfPeopleWhoReadBroadcast()} Personnel</CardTitle>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="stats">
                      <i className="tim-icons icon-sound-wave" /> {this.getTheTitleOfBroadcast()}
                    </div>
                  </CardFooter>
                </Card>
              </Col>
              <Col lg="3" md="6">
                <Card className="card-stats">
                  <CardBody>
                    <Row>
                      <Col xs="5">
                        <div className="info-icon text-center icon-primary">
                          <img src={documents_icon} alt="Documents Icon" />
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Latest SSSP Document Read By</p>
                          <CardTitle tag="h3">{this.getTheNumberOfPeopleWhoReadTheSSSP()} Personnel</CardTitle>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="stats">
                      <i className="tim-icons icon-sound-wave" />{this.getTheLastModifiedForLatestSSSP()}
                    </div>
                  </CardFooter>
                </Card>
              </Col>
              <Col lg="3" md="6">
                <Card className="card-stats">
                  <CardBody>
                    <Row>
                      <Col xs="5">
                        <div className="info-icon text-center icon-success">
                          <i className="tim-icons icon-single-02" />
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Number of people on site today</p>
                          <CardTitle tag="h3">{this.getTotalNumberOfPeopleOnSiteToday()} Personnel</CardTitle>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="stats">
                      <i className="tim-icons icon-sound-wave" />{this.getTotalNumberOfPeopleOnSiteYesterday()} Present Yesterday
                  </div>
                  </CardFooter>
                </Card>
              </Col>
              <Col lg="3" md="6">
                <Card className="card-stats">
                  <CardBody>
                    <Row>
                      <Col xs="5">
                        <div className="info-icon text-center icon-danger">
                          <i className="tim-icons icon-molecule-40" />
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Number of Subcontractors</p>
                          <CardTitle tag="h3">{this.getTotalNumberOfSubcontractors()}</CardTitle>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="stats">
                      <i className="tim-icons icon-sound-wave" /> {this.getTotalNumberOfConsultants()} consultants and {this.getTotalNumberOfClients()} clients
                  </div>
                  </CardFooter>
                </Card>
              </Col>
              <Col md="6">
                <Card className="card-chart">
                  <CardHeader>
                    <h5 className="card-category">Distribution of Staff on Site</h5>
                    <CardTitle tag="h3">
                      <i className="tim-icons icon-world text-primary" />{" "}
                      {this.getTotalNumberOfCompanies()}
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="chart-area">
                      <Doughnut
                        data={this.getDoughnutChartData()}
                        options={chartExample11.options}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col md="6">
                <Card className="card-chart">
                  <CardHeader>
                    <h5 className="card-category">Total Number of Hours on Site</h5>
                    <CardTitle tag="h3">
                      <i className="tim-icons icon-watch-time text-info" />{" "}
                      {this.getTotalNumberOfHoursWorkedByAllCompanies()}
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="chart-area">
                      <Bar
                        data={this.getBarChartData}
                        options={chartExample7.options}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </LoadingOverlay>
        </div>

      </>
    );
  }
}
