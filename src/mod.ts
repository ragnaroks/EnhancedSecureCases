import {DependencyContainer} from 'tsyringe';
import {IPostDBLoadMod} from '@spt-aki/models/external/IPostDBLoadMod';
import {ILogger} from "@spt-aki/models/spt/utils/ILogger";
import {DatabaseServer} from '@spt-aki/servers/DatabaseServer';
import {IDatabaseTables} from '@spt-aki/models/spt/server/IDatabaseTables';

const type1ParentId:String = '5448bf274bdc2dfc2f8b456a';
const type1IdArray:Array<string> = [
    '5857a8b324597729ab0a0e7d', // Beta 安全箱
    '59db794186f77448bc595262', // Epsilon 安全箱
    '5c093ca986f7740a1867ab12', // Kappa 安全箱
    '5c0a794586f77461c458f892', // Boss 安全箱
    '5732ee6a24597719ae0c0281', // 腰部安全包
    '544a11ac4bdc2d470e8b456a', // Alpha 安全箱
    '5857a8bc2459772bad15db29', // Gamma 安全箱
    '64f6f4c5911bcdfe8b03b0dc', // 赛事安全箱
];
const filterArray:Array<string> = [
    // from mod OneCellCases
    '5c0a840b86f7742ffa4f2482', // THICC 物品箱
    '5c093db286f7740a1b2617e3', // 食品保温箱
    '5e2af55f86f7746d4159f07c', // 手榴弹箱
    '619cbf9e0a7c3a1a2731940a', // 钥匙卡收纳盒
    '5b6d9ce188a4501afc1b2b25', // THICC 武器箱
    '619cbf7d23893217ec30b689', // 注射器收纳盒
    '5d235bb686f77443f4331278', // 小型 SICC 包
    '5783c43d2459774bbe137486', // 简易钱包
    '590c60fc86f77412b13fddcf', // 文件包
    '5aafbde786f774389d0cbc0f', // 弹药箱
    '62a09d3bcf4a99369e262447', // Gingy 钥匙串
    '59fb042886f7746c5005a7b2', // 物品箱
    '5b7c710788a4506dec015957', // 幸运 SCAV 垃圾箱
    '59fb016586f7746d0d4b423a', // 钱箱
    '59fb023c86f7746d0d4b423c', // 武器箱
    '60b0f6c058e0b0481a09ad11', // WZ 钱包
    '5aafbcd986f7745e590fff23', // 医疗物品箱
    '5c093e3486f77430cb02e593', // 狗牌包
    '59fafd4b86f7745ca07e1232', // 钥匙收纳器
    '5c127c4486f7745625356c13', // 弹匣箱
    // from mod OneCellCases
    '5910922b86f7747d96753483', // 碳纤维保险箱，任务物品
    '590dde5786f77405e71908b2', // 银行手提箱，任务物品
    '567143bf4bdc2d1a0f8b4567', // 手枪收纳箱
];

class Mod implements IPostDBLoadMod {
    public postDBLoad(container:DependencyContainer): void {
        const logger = container.resolve<ILogger>('WinstonLogger');
        const databaseServer = container.resolve<DatabaseServer>('DatabaseServer');
        
        const tables:IDatabaseTables = databaseServer.getTables();

        for (const id of type1IdArray) {
            const template = tables.templates.items[id] || null;
            if(!template || template._parent !== type1ParentId){continue;}
            template._props.Weight = template._props.Width * template._props.Height * -100;
            const grids = template._props.Grids;
            if(!grids || grids.length<1){continue;}
            for (const grid of grids) {
                if(grid._props.filters.length<1){
                    grid._props.filters.push({Filter:filterArray,ExcludedFilter:[]});
                    continue;
                }
                for (const gridFilter of grid._props.filters) {
                    // 可存入类型做并集，因为安全原因无法使用 lodash
                    //gridFilter.Filter = union(gridFilter.Filter,filterArray);
                    for (const iterator of filterArray) {
                        if(gridFilter.Filter.includes(iterator)){continue;}
                        gridFilter.Filter.push(iterator);
                    }
                    // 不可存入类型做差集，因为安全原因无法使用 lodash
                    //gridFilter.ExcludedFilter = difference(gridFilter.ExcludedFilter,filterArray);
                    const newArray = [];
                    for (const iterator of gridFilter.ExcludedFilter) {
                        if(filterArray.includes(iterator)){continue;}
                        newArray.push(iterator);
                    }
                    gridFilter.ExcludedFilter = newArray;
                }
            }
        }

        logger.warning('[EnhancedSecureCases]: secure-cases are modified');
    }
}

module.exports = {
    mod: new Mod()
};
