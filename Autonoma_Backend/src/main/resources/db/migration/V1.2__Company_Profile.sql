 

/****** Object:  Table [dbo].[COMPANY_CREDENTIAL]    Script Date: 06-05-2026 11:52:18 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AD_COMPANY_CREDENTIAL]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[AD_COMPANY_CREDENTIAL](
	[ID] [int] IDENTITY(1,1) PRIMARY KEY,
	[COMPANY_NAME] [nvarchar](100) NULL,
	[SHORT_NAME] [nvarchar](50) NULL,
	[ADDRESS_1] [nvarchar](200) NULL,
	[ADDRESS_2] [nvarchar](200) NULL,
	[CITY] [nvarchar](50) NULL,
	[STATE] [nvarchar](50) NULL,
	[STATE_CD] [int] NULL,
	[COUNTRY] [nvarchar](50) NULL,
	[PINCODE] [nvarchar](10) NULL,
	[GST_IN] [nvarchar](15) NULL,
	[LIC_RENEWAL_DATE] [datetime] NULL,
	[LIC_EXPIRY_DATE] [datetime] NULL,
	[LOGO_FILE_NAME] [nvarchar](100) NULL,
	[LOGIN_BG_FILE_NAME] [nvarchar](100) NULL,
	[DB_SOURCE_NAME] [nvarchar](10) NULL
) ON [PRIMARY]
END
GO


