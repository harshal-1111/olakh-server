const express = require("express");

const router = express.Router();
const Groom = require("../models/Groom");
const Bride = require("../models/Bride");
const auth = require("../middleware/auth");

const sending_mail = require('./email'); // Update the file path if necessary



// shortlist api
router.patch("/shortlist/:targetId", auth, async (req, res) => {
  const { id, gender } = req.user;
  const targetId = req.params.targetId;
  let hunterUser, targetUser;

  try {
    if (gender === "Male") {
      hunterUser = await Groom.findById(id);
      targetUser = await Bride.findById(targetId);
    } else {
      hunterUser = await Bride.findById(id);
      targetUser = await Groom.findById(targetId);
    }

    if (!hunterUser) {
      return res.status(404).json({ msg: "Hunter user not found" });
    }

    if (!targetUser) {
      return res.status(404).json({ msg: "Target user not found" });
    }

    // Check if targetUser is already shortlisted by hunterUser
    const isAlreadyShortlisted = hunterUser.shortlist.some(
      (item) => item.shortlistedUsers.toString() === targetId
    );

    if (isAlreadyShortlisted) {
      return res
        .status(400)
        .json({ msg: "Target user is already shortlisted" });
    }

    // Update hunterUser's shortlist
    hunterUser.shortlist.push({
      shortlisted: true,
      shortlistedUsers: targetId,
    });
    hunterUser.notifications.push({
      notify: `You Have Shortlisted ${targetUser.firstName + targetUser.surname}`
    })



    await hunterUser.save();

    // Update targetUser's shortlistMe
    targetUser.shortlist.push({
      shortlisted: false,
      shortlistedMe: id,
    });

    targetUser.notifications.push({
      notify: `You are Shortlisted by ${hunterUser.firstName + hunterUser.surname}`
    })
    await targetUser.save();

    res.status(200).json({ msg: "User shortlisted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});





// no of shortlist notification for userdasboard cards




router.get("/shortlistno/:id", auth, async (req, res) => {
  try {
    const { id, gender } = req.user;

    let user;
    if (gender === "Male") {
      user = await Groom.findById(id);
    } else {
      user = await Bride.findById(id);
    }
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    let shortlistCount = 0;

    // Loop through the interactions array and count the number of shortlisted grooms
    user.interactions.forEach((interaction) => {
      if (interaction.shortlisted === true) {
        shortlistCount++;
      }
    });

    res.send({ totalShortlisted: shortlistCount });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// get list of shortlistd users

router.get("/shortlisted/:id", auth, async (req, res) => {
  try {
    const { id, gender } = req.user;

    let user;
    if (gender === "Male") {
      user = await Groom.findById(id).populate({
        path: "shortlist.shortlistedUsers",
        model: "BRIDE",
        select: "firstName profile",
      });
    } else {
      user = await Bride.findById(id).populate({
        path: "shortlist.shortlistedUsers",
        model: "GROOM",
        select: "firstName profile",
      });
    }

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const shortlistedUsers = user.shortlist.filter((shortlist) => shortlist.shortlisted === true);
    res.status(200).json(shortlistedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving shortlisted users" });
  }
});


// who shortlisted me

router.get("/shortlistme/:id", auth, async (req, res) => {
  try {
    const { id, gender } = req.user;

    let User;
    let userType;
    if (gender === "Male") {
      User = Groom;
      userType = "GROOM";
    } else {
      User = Bride;
      userType = "BRIDE";
    }

    const user = await User.findById(id).populate({
      path: "shortlist.shortlistedMe",
      select: "firstName profile",
    });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const shortlistedMeUsers = user.shortlist.filter(
      (item) => item.shortlistedMe.length > 0
    ).map(item => item.shortlistedMe);

    res.status(200).json(shortlistedMeUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving shortlisted users" });
  }
});





// interest api
router.patch("/interest/:targetId", auth, async (req, res) => {
  const { id, gender } = req.user;
  const targetId = req.params.targetId;
  let hunterUser, targetUser;

  try {
    if (gender === "Male") {
      hunterUser = await Groom.findById(id);
      targetUser = await Bride.findById(targetId);
    } else {
      hunterUser = await Bride.findById(id);
      targetUser = await Groom.findById(targetId);
    }

    if (!hunterUser) {
      return res.status(404).json({ msg: "Hunter user not found" });
    }

    if (!targetUser) {
      return res.status(404).json({ msg: "Target user not found" });
    }

    // Check if targetUser is already interested by hunterUser
    const isAlreadyInterested = hunterUser.interests.some(
      (item) =>

        item.interestedByMe._id.toString() === targetId
    );



    if (isAlreadyInterested) {
      console.log('already match');

      return res.status(200).json({ msg: "Target User Already Interested" });
    }

    // Update hunterUser's interests
    hunterUser.interests.push({
      interested: true,
      interestedByMe: targetId,
    });
    hunterUser.notifications.push({
      notify: `You have shown interest in ${targetUser.firstName} ${targetUser.surname}`
    });

    await hunterUser.save();

    // Update targetUser's interests
    targetUser.interests.push({
      interested: false,
      interestedInMe: id,
    });

    targetUser.notifications.push({
      notify: `You are shown interest by ${hunterUser.firstName} ${hunterUser.surname}`
    });

    await targetUser.save();

    if(targetUser.email){ 
      sending_mail(targetUser.email,'Interested in me' , 'somebody is interested in you check now');
    }

    res.status(200).json({ msg: "User interested successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});





// get interested users

router.get("/interested/:id", auth, async (req, res) => {
  try {
    const { id, gender } = req.user;

    let user;
    if (gender === "Male") {
      user = await Groom.findById(id).populate({
        path: "interests.interestedByMe",
        model: "BRIDE",
        select: "firstName profile",
      });
    } else {
      user = await Bride.findById(id).populate({
        path: "interests.interestedByMe",
        model: "GROOM",
        select: "firstName profile",
      });
    }

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const interestedUsers = user.interests.filter(
      (interest) => interest.interested === true
    );
    res.status(200).json(interestedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving interested users" });
  }
});



// get user interested in me or interest received
router.get("/interestedinme/:id", auth, async (req, res) => {


  try {
    const { id, gender } = req.user;
 
    let User;
    let userType;
    if (gender === "Male") {
      User = Groom;
      userType = "GROOM";
    } else {
      User = Bride;
      userType = "BRIDE";
    }
 
    const user = await User.findById(id).populate({
      path: "interests.interestedInMe",
      select: "email firstName profile",
    });

    
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const interestedInMeUsers = user.interests;


    res.status(200).json(interestedInMeUsers);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving interestedInMe users" });
  }
});



// Delete user interested in me or interest received
router.post("/interestedinme_delete/:personid", auth, async (req, res) => {
  try {
    console.log("salman2");
    const { personid } = req.params;
    const { id, gender } = req.user;

    let User;
    let userType;
    if (gender === "Male") {
      User = Groom;
      userType = "GROOM";
    } else {
      User = Bride;
      userType = "BRIDE";
    }

    console.log("personid", personid);
    const user = await User.findById(id).populate({
      path: "interests.interestedInMe",
      select: "firstName profile",
    });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Find the index of the interestedInMe user to be deleted
    const interestedInMeUsers = user.interests;

    const index = interestedInMeUsers.findIndex(
      (interest) => interest.interestedInMe._id.toString() === personid
    );

    if (index === -1) {
      console.log('here');
      return res.status(400).json({ msg: "Interested user not found" });
    }

    // Remove the interestedInMe user from the interests array
    interestedInMeUsers.splice(index, 1);

    // Save the updated user
    await user.save();

    res.status(200).json({ msg: "Interested user deleted successfully" });


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting interested user" });
  }
});








// post delete user interested in me or interest received
// router.post("/interestedinme_delete/:id", auth, async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Assuming you have a model for the "interestedinme" collection
//     const interestedInMe = await InterestedInMe.findByIdAndDelete(id);

//     if (!interestedInMe) {
//       return res.status(400).json({ msg: "User not found" });
//     }

//     res.status(200).json({ msg: "User deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//   }
// });



// router.post("/interestedinme_delete/:id", auth, async (req, res) => {


//   try {
//     const { gender } = req.user;
//     const { id } = req.params;

//     let user;
//     if (gender === "Male") {
//       user = await Bride.findByIdAndDelete(id);
//     } else {
//       user = await Groom.findByIdAndDelete(id);
//     }

//     if (!user) {
//       return res.status(400).json({ msg: "User not found" });
//     }

//     res.status(200).json({ user });
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//   }
// });

//   try {
//     const { id } = req.user;
//     console.log(id)
//     res.status(200).json(id);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error retrieving interestedInMe users" });
//   }
// });



module.exports = router;
