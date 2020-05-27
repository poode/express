const db = require('../../models');
const { hashPassword, signToken, verifyPassword, signRefreshToken, verifyToken } = require('./strategies/util');

const getUserById = async id => {
  const user = await db.user.findOne({ where: { id }, raw: true });
  if(!user) return { err: `User with ID ${id} is not found`, status: 404 };
  return { user };
}
exports.getUserById = getUserById

async function getUserByEmail(email) {
  const user = await db.user.findOne({ where: { email }, raw: true });
  if(!user) return { err: `User with email ${email} is not found`, status: 404 };
  return { user };
};
exports.getUserByEmail = getUserByEmail;

async function getUserByUsername(username) {
  const user = await db.user.findOne({ where: { username }, raw: true });
  if(!user) return { err: `User with username ${username} is not found`, status: 404 };
  return { user };
};
exports.getUserByUsername = getUserByUsername;

async function getUserByUsername(username) {
  const user = await db.user.findOne({
    where: {
      username
    },
    raw: true
  });
  if (user) return {
    err: `User with username ${username} is found please try another username`,
    status: 400
  };

  return {
    isUniqueUsername: true
  };
};
exports.getUserByEmail = getUserByEmail;

exports.registerUser = async reqBody => {
  const { err, user} = await getUserByEmail(reqBody.email);
  if (user) {
    return { err: `User with email ${reqBody.email} is already found`, status: 409 };
  }

  const duplicated = await getUserByUsername(reqBody.username);
  if (duplicated.err) {
    return { err, status };
  }

  reqBody.password = await hashPassword(reqBody.password);
  const createdUser = await db.user.create(reqBody);
  delete createdUser.dataValues.password;
  return { createdUser };
}

exports.login = async (reqBody) => {
  const { err, user, status } = await getUserByEmail(reqBody.email);
  if(err) return { err , status };
  const validPassword = await verifyPassword(reqBody.password, user.password);
  if(!validPassword) return { err: 'password is wrong!', status: 406 };
  delete user.password;
  const response = {
    message: 'success', 
    data: {
      user,
      accessToken: signToken(user),
      refreshToken: signRefreshToken(user),
    }
  }
  // this if only user will login on one device, other will lose access
  if(JSON.parse(process.env.ONE_DEVICE_PER_USER)){
    console.log('One Device Per User To Login');
    const t = await db.sequelize.transaction();
  
    try {
      const userToken = await db.userToken.findOne({ where: { userId: user.id }, transaction: t });
      if(userToken) {
        await db.userToken.update({ token: response.data.refreshToken }, { where : { userId: userToken.toJSON().userId }, transaction: t });
      } else {
        await db.userToken.create({ userId: user.id, token: response.data.refreshToken }, { transaction: t });
      }
  
      await t.commit();
    } catch (error) {
      console.log(error.message);
      await t.rollback();
    }

  } else {
    // this if user can login from any place at same time
    console.log('Many Device Per User To Login');
    await db.userToken.findOrCreate({ where: { userId: user.id, token: response.data.refreshToken } });
  }
  


  return { response };
}

exports.socialLogin = async ({ user }) => {
  if(!user._json.email) return { err: 'please allow us to read your email' , status: 400 };
  const found = await getUserByEmail(user._json.email);
  if(found.err) return { err: found.err , status: found.status };

  delete found.user.password;
  const response = {
    message: 'success', 
    data: {
      user: found.user,
      token: signToken(found.user)
    }
  }
  return { response };
}

exports.changePassword = async ({ user, body }) => {
  const { id } = user;
  const { oldPassword, newPassword } = body;
  const result = await getUserById(id);
  const validPassword = await verifyPassword(oldPassword, result.user.password);
  if(!validPassword) return { err: 'password is wrong!', status: 406 };
  await db.user.update({ password: await hashPassword(newPassword)}, { where: { id }});
  return { response: 'success!' };
}

exports.updateUserProfile = async ({ user, body }) => {
  const emailFound = await getUserByEmail(body.email);

  if(emailFound.user && emailFound.user.id !== user.id) {
    return { err: `Please use another email as ${body.email} already used`, status: 400 };
  }
  const usernameFound = await getUserByUsername(body.username);

  if(usernameFound.user && usernameFound.user.id !== user.id) {
    return { err: `Please use another username as ${body.username} already used`, status: 400 };
  }

  await db.user.update(body,{
    where: {
      id: user.id
    }
  });

  const newProfile = await db.user.findOne({ where: { id: user.id }, raw: true });
  delete newProfile.password;
  return { updatedUser: newProfile };
}

exports.getUserProfile = async ({ user }) => {
  const found = await getUserByEmail(user.email);
  if(found.err) return { err: found.err, status: found.status };
  delete found.user.password;
  return { user: found.user };
}

exports.getAccessToken = async ({ query }) => {
  if(!query) return { err: 'missing query param token', status: 400 }
  const { q } = query;
  if(!q) return { err: 'missing token', status: 400 }

  const { err } = await verifyToken({ token: q, type: 'refreshToken' });
  if(err) return { err , status: 417 };

  const userToken = await db.userToken.findOne({ where: { token: q }, include: [db.user] });
  if(!userToken) return { err: 'This user is did not login yet', status: 400 }
  const { user } = userToken.toJSON();
  delete user.password;
  return {
    accessToken: signToken(user),
  }
}
