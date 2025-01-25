import { DataTypes, Model } from 'sequelize';
import sequelize from './libs/database';

class Gadget extends Model {
  public id!: string;
  public name!: string;
  public status!: 'Available' | 'Deployed' | 'Destroyed' | 'Decommissioned';
  public codename!: string;
  public missionSuccessProbability!: number;
  public decommissionedAt?: Date;
}

Gadget.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codename: {
    type: DataTypes.STRING,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('Available', 'Deployed', 'Destroyed', 'Decommissioned'),
    defaultValue: 'Available'
  },
  missionSuccessProbability: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: () => Math.floor(Math.random() * 100)
  },
  decommissionedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Gadget'
});

export default Gadget;