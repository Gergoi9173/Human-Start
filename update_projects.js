const fs = require('fs');

const rawMapping = `
KHBCMDM19S
KH - CM\\OD support
KHBNVED22S
KH - eDoc Support 2023
TITFNDM01D
OPUS TITÁSZ - FileNet bevezetés
CIBFNDM22S
CIB - Filenet support
TITFNDM23S
OPUS TITÁSZ - Support
EGIFNDM23S
EGIS - FN/DC support
NKMDWIS17D
NKM - DWH HIEP DL platform
TITUMDM01D
OPTESZ - Ultimate továbbfejlesztés
PMIFNDM24S
PMI Magtár support
CASBWDR01D
CASCADE - DRÓN PROJEKT BAW SPRINT1
NKMDWIS25S
NKM - DWH support 2025
NKMFNDM25S
NKM - FileNet/BAW support 2025
PMIFNDM01D
PMI Magtár upgrade
MVIFNDM25S
MVMI - ÉDFH support 2025
HIPFNDM01D
HIPA - Integrált ügyviteli rendszer
MVRFNDM25S
MAVIR FN Support 2025-26
MAKFNDM24S
MÁK - FileNet támogatás projekt része
GENANCO01L
GENERALI - COGNOS LICENSZ
OAHFNDM25S
OAH - FileNet support 2025
MVRFNDM25O
MAVIR support - opcionális 
MVIFNDM25D
MVMI - DÁP DSO - eÜgyintézési front-end és back-end (V836461)
PA2FNDM25S
Paks2 - FileNet support 2025
NZRFNDM25S
NÜSZ - FileNet support
NZRFNDM02D
NÜSZ - FilleNet verzió upgrade
PA2BWDM08D
Paks2 - REV8 T&M
IQSIBDB03E
IQSOFT - DB2 oktatás
KHBANTM25S
KHB- Tesztadatmendzsment support 2025-2026
TITBWDM05D
OPTESZ - Beszerzési igény - Verseny alóli felmentés engedélyezése 
TITUMDM12D
OPTESZ - Ultimate Ügyfélszolgálat - Automatikus email feldolgozás
KHBANOD04D
KHB - OPUS OD tanácsadás 25Q3
ERSDCDM03D
ERSTE - Datacap platform és adatgazdagítás 
ERSFNDM05D
ERSTE - DC MOVE FN tanácsadás T&M
TITFNDM04D
OPTESZ - DMS Ultimate - MVM Next kikapcsolás értesítő/posta 
KSKCCAI01D
KSZK - AI ügyfélszolgálat támogatás
ERSANCG05D
ERSTE - COGNOS T&M3 PROJEKT RÉSZE
TITBWDM03D
OPTESZ - Beszerzési opció CR1
MVIFNDM26D
MVMI - UNITY
MVIFNDM26S
MVMI - FileNet support 2026-2028
TITUMDM14D
OPTESZ - Tagvállalati CR
TITUMDM13D
OPTESZ - Új Szerződéstár Ultimateben
TITUMDM11D
OPTESZ - RNY manuális és automatikus bekérdezés létrehozása és DÁP Modul bevezetés
KHBANOD05D
KHB - OD SSO tanácsadás
GENANCG26S
GENERALI - COGNOS SUPPORT 2026
GARFNDM26S
Garnatiqa - Support 2025/26
RGZFNDM31D
Richter - MEBIT
ERSFNDM11D
ERSTE - Hiteles kivonatok WF készítése
ERSFNDM04D
ERSTE - Dokumentum feldolgozás AI eszközök támogatásával
ERSFNDM10D
ERSTE - Jogosultságok kiosztó kialakítása
ERSFNDM09D
ERSTE - Kafka integráció
HVKBWDM01D
Honvédkórház - Beszerzési WF
NKMDWIS27D
NKM - DWH EDGE I.FÁZIS
OAHFNDM06D
OAH - Fejlesztési keret
NKEOSPO25S
NKE support + fejlesztés
100_TITUMDM15D
OPTESZ - Ügyfélszolgálat TOP20
KHBCMDM02L
KHB - Spectrum Scale licensz megújítása
NKMFNDM18D
NKM - FN két új dokumentum típus létrehozása
NKMFNDM19D
NKM - Szervezeti egység hierarchia bővítése
NKMFNDM20D
NKM - FN DVACCS 2. ütem GEODOK-HAPDOC módosítások
NLBCMDM26S
NLB - CM Support
TITFNDM15D
OPTESZ - E-mailen érkező és szkennelt számlák különálló mellékletének kezelése
NKMFNDM14D
NKM - FN UNITY
FNXOSPO01T
FORNAX - T&M SUPPORT PROJEKT RÉSZ
FNXOSPO02T
FORNAX - T&M 2026 PROJEKT RÉSZ
KHBANOD08D
KHB - OD SSO tanácsadás
PA2BWDM09D
Paks2 - REV8 T&M CR1
ERSDCDM05D
ERSTE - Papír alapon beérkezett küldemények digitalizálása
MVROSPR26S
MAVIR - PRIZMA SUPPORT 2026
FNXOSPO03T
FORNAX - T&M 2026 ELŐLEG RÉSZ 
HIPFNDM02L
HIPA - IBM SW követés
100_MVIFNDM28D
MVMI - FileNet upgrade 2026
100_HIPFNDM03D
HIPA - HIPER CR-ek
MVIFNDM03L
MVMI - Aspose licensz 2026-2029
NKMFNDM26S
NKM - FileNet/BAW support
NKHOSPO03D
NKOH - közbeszerzési portál rendszerfelülvizsgálat 
KHBFNDM02D
KH - Document Management Strategy 
NLBPMDM01D
NLB print management
ONFFNED04D
MÁK - Filenet 3 környezet kialakítása
NKMFNDM10D
NKM - DOKMAN LINUX Update
MVIFNDM27D
MVMI - PLUTO NSCALE tanácsadás
ALFBWST01D
ALFA - Sablontár jóváhagyással
TITFNDM02D
OPTESZ -  48_Szerelői dokumentumok kezelése
IPOFNDM01D
Ipoteka - ECM bevezetés
TITUMDM04D
OPTESZ - Ultimate egyedi adatok és SAP interfész
TITFNDM07D
OPTESZ - TIGÁZ integráció
NKMDWIS26S
NKM - DWH support 2026
NKMDWIS28D
NKM - DWH EDGE T&M kertet
NKMDWIS29D
NKM - DWH IIAS kiváltás CP4D-ra
TITUMDM05D
OPTESZ - Főkosár entitás kialakítása
TITUMDM07D
OPTESZ - DMS-SAP interface továbbfejlsztése
MAVFNDM01D
MÁV - Volán FileNet migráció MVMI-ből
OAHFNDM06D
OAH - 2025 Fejlesztési keret
MVROSPR25S
MAVIR Prizma Oppty 2025
BTHSSDM01D
Bethesda Betegdokumentum szkennelés
NKMDWIS30D
NKM - DWH DVACCS 3.ütem
MBHFNDM01D
MBH - Document Management
ERSANCG04D
ERSTE - COGNOS DASHBOARD
TITFNDM03D
OPTESZ - DÁP Dokumentumkezelés
RGZFNDM30D
Richter - OCR solution
NKMDWIS31D
NKM - DWH UNITY 
BAIFNDM01D
BAI - ECM
NOVPEÜF01S
NOVA - Pricing Engine ÜFM szolgáltatás
CIBFNDM24D
CIB - FileNet upgrade (Doc2533611937)
HUCFNDM01D
HUNGAROCONTROL - Dokumentum Menedzsment
MFGODRE01D
MFG - ODM szabálymotor
HIPFNDM26S
HIPA - SUPPORT 2026-2027
TITBWDM04D
OPTESZ - Automatikus számlaiktatáshoz kapcsolódó Datacap fejlesztési igények
KHBANTM26S
KHB - TDM éves support 2026-2027
ERSFNDM01L
ERSTE - CP4BA licensz bővítés
HUCDCDM01D
HUNGAROCONTROL - AI alapú számla érkeztetés
AUCBWDM01D
AUCHAN - BPM
OAHDCDM01D
OAH - AI PILOT
ALFBWDM01D
ALFA - Beszerzési és szerződéskezelő rendszer
ZABFNDM01D
ZABA - DMAISCAN
KHBANOD10D
KHB - CM DELETE tanácsadás
MAPFNDM01L
MAP - FileNet és DataCap licensz beszerzés
MAPFNDM01D
MAP - LTK/POSTA CR napok
MAKFNDM26S
MÁK - FileNet Support OPPTY RÉSZ
NZRFNDM26S
NÜSZ - FileNet support
PA2FNDM26S
PA2 - FileNEt/BAW Support
PMIFNDM26S
PMI - Support 2026
GARFNDM27S
GHG - Support 2026/27
NKEOSPO26S
NKE - Support
TITBWDM07D
OPTESZ - Beszerzési opcióhoz kapcsolódó továbbfejlesztési igények CR2
NKHOSPO26S
NKOH - Support 2026
IHTOSPO01D
IHT - Beszerzés Támogató Rendszer – IHT Portál
HIPFNDM02D
HIPA - HIPER MIGRÁCIÓ CR
NKMFNDM21D
NKM - FN és BAW Upgrade
TITFNDM06D
OPTESZ - IBM upgrade
HVKBWDM26S
HVK - Beszerzési rendszer support
HVKDCDM26S
HVK - DMAIScan Support
DKUOSPO02T
FORNAX T&M 2026 OPPORTUNITY RÉSZ
ERSFNDM12D
ERSTE - Dokumentum feldolgozás AI - új folamatok
MVIIBFN06E
MVMI - Filenet oktatás 2026
MVIIBDB01E
MVMI - DB2 oktatás
MVMIBAR01D
MVM - Archiválás struktúrált és struktúrálatlan adatokhoz
TITUMDM16D
OPTESZ - Igazgatósági ülések
OAHFNDM07D
OAH - FileNet upgrade
PA2FNDM09D
Paks2 - FileNet\\BAW upgrade
EGIFNDM06D
EGIS - FileNet upgrade
ERSFNDM26S
ERSTE - FileNet support 2026
DKUOSPO04T
FORNAX - T&M SUPPORT OPPORTUNITY RÉSZ
CIBFNDM28D
CIB - Paperless process - classdefs' creation
RGZFNDM06D
Richter - FileNet upgrade 
HIPFNDM04D
HIPA - HIPER ÉLESÍTÉS KRITIKUS CR4
T36IBDB03E
T360 - DB2 viszolteladói ajánlat
RAFANTM01D
Raiffaisen - Minőségi tesztadat előállítás és adatmaszkolás
NKMDWIS33D
NKM - DWH DÉMÁSZ SCADA tervezés fejlesztés.
CIBFNDM30D
CIB - FileNet költöztetés Hyper-V Spectrum Scale Clusterre
MVIFNDM29D
MVMI - S4HANA HCM upgrade ICCSAP átállás
NKMBWDM07D
NKM - eSZAB kivezetés
MVRFNDM08D
MAVIR - IBM FileNet upgrade 2026
MVRFNDM09D
MAVIR - IBM FileNet áttérés OpenShiftre
KHBANOD26S
KHB - CMOD & RB üzemeltetés és support
OAHFNDM08D
OAH - Felülhitelesítés
CIBANTM01D
CIB - Optim alapú archiválás és tesztadatmenedzsment
CIBFNDM31D
CIB - Szabályozástár CR3
FCMCCAI01D
FCM -CCAI
MAPFNDM26S
MAP - LTK/POSTA DC/FN Support
KHBCMDM10D
KHB - CMoD infrastruktúra átalakítás 2026
KSKCCAI26S
KSZK - CCAI support
GENDCDM01D
GENERALI - KOFAX kiváltás DATACAP-pel
NKMFNDM22D
NKM - FN plomba projekt
ERSFNDM13D
ERSTE - IMR EAKTA kiváltás
PRGBWDM01D
PRG - Digitális munkaügyi dokumentumkezelő és elektronikus aláírás rendszer
GARIBAI01L
GAR - IBM Bob AI licensz értékesítés
CIBFNDM32D
CIB - FileNet FaktorIMX
`;

const lines = rawMapping.trim().split('\n').filter(l => l.trim() !== '');
const map = {};
for (let i = 0; i < lines.length; i += 2) {
    map[lines[i].trim()] = lines[i+1].trim();
}

let projects = JSON.parse(fs.readFileSync('data/projects.json', 'utf8'));

let nextId = Math.max(...projects.map(p => p.id), 0) + 1;

for (const [code, name] of Object.entries(map)) {
    const p = projects.find(p => p.code === code);
    if (p) {
        p.name = name;
    } else {
        projects.push({ id: nextId++, code, name });
    }
}

fs.writeFileSync('data/projects.json', JSON.stringify(projects, null, 2));
