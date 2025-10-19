import { DataTypes } from "sequelize";
import sequelize from "../db";

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

export default RefreshToken;
