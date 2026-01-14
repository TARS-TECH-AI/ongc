const cecMembers = [
  {name:"Jagesh Kumar Somkuwar", postInAssociation:"President-CWC (Off.)", unit:"Mumbai", cpfNo:82161},
  {name:"B Prasada Rao", postInAssociation:"General Secretary-CWC", unit:"Agartala", cpfNo:82150},

  {name:"Dinesh Bhai Ravji Bhai Vasava", postInAssociation:"Branch Chairman", unit:"Ankleshwar", cpfNo:80602},
  {name:"Patel Rohitkumar Madhavbhai", postInAssociation:"Branch Secretary", unit:"Ankleshwar", cpfNo:72398},
  {name:"Kanubhai Balu Bhai Vasava", postInAssociation:"CEC Member", unit:"Ankleshwar", cpfNo:72650},
  {name:"Mahesh N Vasana", postInAssociation:"CEC Member", unit:"Ankleshwar", cpfNo:80694},
  {name:"Sanjay Kumar Somchandbhai", postInAssociation:"CEC Member", unit:"Ankleshwar", cpfNo:82699},
  {name:"Divya Rupali Kachhap", postInAssociation:"CEC Member", unit:"Ankleshwar", cpfNo:136532},

  {name:"Savan Parmar", postInAssociation:"Branch Chairman", unit:"Ahmedabad", cpfNo:121382},
  {name:"Dr. Vishal Kumar", postInAssociation:"Branch Secretary", unit:"Ahmedabad", cpfNo:139261},
  {name:"K. M. Sengal", postInAssociation:"CEC Member", unit:"Ahmedabad", cpfNo:67834},
  {name:"Narendra Kumar S. Parmar", postInAssociation:"CEC Member", unit:"Ahmedabad", cpfNo:131021},
  {name:"Hemangi I. Rathod", postInAssociation:"CEC Member", unit:"Ahmedabad", cpfNo:132528},
  {name:"V. V. Machhar", postInAssociation:"CEC Member", unit:"Ahmedabad", cpfNo:67862},

  {name:"Smriti Ranjan Debbarma", postInAssociation:"Branch Chairman", unit:"Agartala", cpfNo:93509},
  {name:"Joydeep Das", postInAssociation:"Branch Secretary", unit:"Agartala", cpfNo:132338},
  {name:"Samarjit Bongcher", postInAssociation:"CEC Member", unit:"Agartala", cpfNo:121263},

  {name:"Ram Bahal Singh", postInAssociation:"Branch Chairman", unit:"Bokaro", cpfNo:78346},
  {name:"Gadling Avi Deepakrao", postInAssociation:"Branch Secretary", unit:"Bokaro", cpfNo:136389},

  {name:"Kunal Prembhai Dabhi", postInAssociation:"Branch Chairman", unit:"Cambay", cpfNo:130216},
  {name:"Sandeep Arse", postInAssociation:"Branch Secretary", unit:"Cambay", cpfNo:135557},
  {name:"Sandeep Kumar", postInAssociation:"CEC Member", unit:"Cambay", cpfNo:133889},
  {name:"Rakesh Kumar Meena", postInAssociation:"CEC Member", unit:"Cambay", cpfNo:131771},

  {name:"Arumugam P", postInAssociation:"Branch Chairman", unit:"Chennai", cpfNo:78310},
  {name:"Gowtham Raj R", postInAssociation:"Branch Secretary", unit:"Chennai", cpfNo:122527},
  {name:"Chozhan M", postInAssociation:"CEC Member", unit:"Chennai", cpfNo:122582},
  {name:"Jayalakshmi K", postInAssociation:"CEC Member", unit:"Chennai", cpfNo:73623},

  {name:"Jamshed", postInAssociation:"Branch Chairman", unit:"Dehradun", cpfNo:121650},
  {name:"Om Prakash Meena", postInAssociation:"Branch Secretary", unit:"Dehradun", cpfNo:125426},
  {name:"Hari Das", postInAssociation:"CEC Member", unit:"Dehradun", cpfNo:78275},
  {name:"Mahendra Singh", postInAssociation:"CEC Member", unit:"Dehradun", cpfNo:79315},
  {name:"Monika", postInAssociation:"CEC Member", unit:"Dehradun", cpfNo:79478},

  {name:"Dayanand", postInAssociation:"Branch Chairman", unit:"Delhi", cpfNo:105074},
  {name:"Balkaran Singh", postInAssociation:"Branch Secretary", unit:"Delhi", cpfNo:93626},
  {name:"Shyam Sundar", postInAssociation:"CEC Member", unit:"Delhi", cpfNo:46865},

  {name:"Kalpesh Chandra Patil", postInAssociation:"Branch Chairman", unit:"Goa", cpfNo:136576},

  {name:"Jitendra Kumar Dhanji Bhai Parmar", postInAssociation:"CEC Member", unit:"Hazira", cpfNo:93348},
  {name:"Bhupeshkumar Hanish Choudhari", postInAssociation:"CEC Member", unit:"Hazira", cpfNo:83933},

  {name:"Robin Chandra Das", postInAssociation:"Branch Chairman", unit:"Jorhat", cpfNo:63883},
  {name:"Arup Jyoti Doley", postInAssociation:"Branch Secretary", unit:"Jorhat", cpfNo:127269},
  {name:"Biswajit Deori", postInAssociation:"CEC Member", unit:"Jorhat", cpfNo:91731},
  {name:"Rajib Kr Mili", postInAssociation:"CEC Member", unit:"Jorhat", cpfNo:91868},

  {name:"Vishram Meena", postInAssociation:"Branch Chairman", unit:"Jodhpur", cpfNo:73047},
  {name:"Bhika Ram", postInAssociation:"Branch Secretary", unit:"Jodhpur", cpfNo:123875},

  {name:"Jarapala Bhashya", postInAssociation:"Branch Chairman", unit:"Kakinada", cpfNo:82103},
  {name:"P Rajashekar Joshi", postInAssociation:"Branch Secretary", unit:"Kakinada", cpfNo:53565},

  {name:"S Gangatharan", postInAssociation:"Branch Chairman", unit:"Karaikal", cpfNo:84224},
  {name:"B Balasubramanian", postInAssociation:"Branch Secretary", unit:"Karaikal", cpfNo:124886},
  {name:"Rajkumar R", postInAssociation:"CEC Member", unit:"Karaikal", cpfNo:126784},
  {name:"I Vezhavendhan", postInAssociation:"CEC Member", unit:"Karaikal", cpfNo:126758},

  {name:"Barun Kumar Barua", postInAssociation:"Branch Chairman", unit:"Kolkata", cpfNo:75595},
  {name:"Tapas Kumar Das", postInAssociation:"Branch Secretary", unit:"Kolkata", cpfNo:75584},
  {name:"Krishna Gopal Saha", postInAssociation:"CEC Member", unit:"Kolkata", cpfNo:75324},

  {name:"Vipin Kumar", postInAssociation:"Branch Chairman", unit:"Mehsana", cpfNo:121730},
  {name:"Sunil Kumar Meena", postInAssociation:"Branch Secretary", unit:"Mehsana", cpfNo:134475},
  {name:"Deepak Khatik", postInAssociation:"CEC Member", unit:"Mehsana", cpfNo:136288},
  {name:"Zeel Kantilal Parmar", postInAssociation:"CEC Member", unit:"Mehsana", cpfNo:134038},
  {name:"Mahesh Kumar R Kotwal", postInAssociation:"CEC Member", unit:"Mehsana", cpfNo:80840},

  {name:"Parag Shankar Ramteke", postInAssociation:"Branch Chairman", unit:"Mumbai", cpfNo:121184},
  {name:"Ratan Namdeo Bhanarkar", postInAssociation:"Branch Secretary", unit:"Mumbai", cpfNo:83662},
  {name:"Jyoti Deepak Ahire", postInAssociation:"CEC Member", unit:"Mumbai", cpfNo:126322},
  {name:"Sachin Arvind Sherkhane", postInAssociation:"CEC Member", unit:"Mumbai", cpfNo:122776},
  {name:"Vikrant Ravindra Kale", postInAssociation:"CEC Member", unit:"Mumbai", cpfNo:126369},
  {name:"Preshit Prafulla Shedge", postInAssociation:"CEC Member", unit:"Mumbai", cpfNo:130411},

  {name:"Dembi Ram Panging", postInAssociation:"Branch Chairman", unit:"Nazira", cpfNo:91978},
  {name:"Jagat Chandra Hazarika", postInAssociation:"Branch Secretary", unit:"Nazira", cpfNo:91968},
  {name:"Dipu Das", postInAssociation:"CEC Member", unit:"Nazira", cpfNo:91967},
  {name:"Gahin Basumatary", postInAssociation:"CEC Member", unit:"Nazira", cpfNo:91893},
  {name:"Rupjyoti Mech", postInAssociation:"CEC Member", unit:"Nazira", cpfNo:91890},
  {name:"Utpal Sonowal", postInAssociation:"CEC Member", unit:"Nazira", cpfNo:129711},

  {name:"Kommu Satyanarayana", postInAssociation:"Branch Chairman", unit:"Rajahmundry", cpfNo:46876},
  {name:"Ravindra Nunavath", postInAssociation:"Branch Secretary", unit:"Rajahmundry", cpfNo:105018},
  {name:"Siringi Raja Kumar", postInAssociation:"CEC Member", unit:"Rajahmundry", cpfNo:81206},
  {name:"Shobha Rani Durgam", postInAssociation:"CEC Member", unit:"Rajahmundry", cpfNo:122344},

  {name:"Ajit Suklaibadya", postInAssociation:"Branch Chairman", unit:"Silchar", cpfNo:61899},
  {name:"Swapan Kumar Barman", postInAssociation:"Branch Secretary", unit:"Silchar", cpfNo:61866},
  {name:"Chiranjit Baidya", postInAssociation:"CEC Member", unit:"Silchar", cpfNo:128799},

  {name:"Vishnu Ramchandra Vhatkar", postInAssociation:"Branch Chairman", unit:"Uran", cpfNo:93145},
  {name:"Nishikant M Walade", postInAssociation:"Branch Secretary", unit:"Uran", cpfNo:82022},
  {name:"Vishwas Raul Lokhande", postInAssociation:"CEC Member", unit:"Uran", cpfNo:83185},
  {name:"Sarvendra Kumar Saket", postInAssociation:"CEC Member", unit:"Uran", cpfNo:132083},

  {name:"Suresh U Tapodhan", postInAssociation:"Branch Chairman", unit:"Vadodara", cpfNo:72443},
  {name:"Ramesh Kumar S Vasava", postInAssociation:"Branch Secretary", unit:"Vadodara", cpfNo:80839},
  {name:"Hemanthbhai Thakkorbhi Parmar", postInAssociation:"CEC Member", unit:"Vadodara", cpfNo:132507},
  {name:"Khim Singh Rawat", postInAssociation:"CEC Member", unit:"Vadodara", cpfNo:64069}
];

export default cecMembers;
