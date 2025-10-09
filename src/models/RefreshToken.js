import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const RefreshToken = sequelize.define('RefreshToken', {
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

User.hasMany(RefreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

export default RefreshToken;
