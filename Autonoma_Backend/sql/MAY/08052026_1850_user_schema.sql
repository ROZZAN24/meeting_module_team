 
/****** Object:  Table [dbo].[bos_modules]    Script Date: 08-05-2026 16:46:15 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[bos_modules](
	[module_id] [int] NOT NULL,
	[mod_code] [nvarchar](10) NULL,
	[mod_name] [nvarchar](100) NULL,
 CONSTRAINT [PK_bos_modules] PRIMARY KEY CLUSTERED 
(
	[module_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[bos_sub_modules]    Script Date: 08-05-2026 16:50:05 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[bos_sub_modules](
	[sub_mod_id] [int] NOT NULL,
	[mod_id] [int] NULL,
	[sub_mod_code] [nvarchar](10) NULL,
	[sub_mod_name] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_bos_sub_modules] PRIMARY KEY CLUSTERED 
(
	[sub_mod_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[bos_sub_modules]  WITH CHECK ADD  CONSTRAINT [FK_bos_sub_modules_bos_modules] FOREIGN KEY([mod_id])
REFERENCES [dbo].[bos_modules] ([module_id])
GO

ALTER TABLE [dbo].[bos_sub_modules] CHECK CONSTRAINT [FK_bos_sub_modules_bos_modules]
GO


/****** Object:  Table [dbo].[bos_pages]    Script Date: 08-05-2026 17:13:18 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[bos_pages](
	[page_id] [int] NOT NULL,
	[mod_id] [int] NOT NULL,
	[sub_mod_id] [int] NULL,
	[page_code] [nvarchar](10) NULL,
	[page_name] [nvarchar](100) NOT NULL,
	[enabled] [int] NULL,
 CONSTRAINT [PK_bos_pages] PRIMARY KEY CLUSTERED 
(
	[page_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO



/****** Object:  Table [dbo].[bos_user_module]    Script Date: 08-05-2026 17:38:30 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[bos_user_module](
	[user_id] [nvarchar](50) NOT NULL,
	[module_id] [int] NOT NULL,
	[enabled] [int] NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[bos_user_module]  WITH CHECK ADD  CONSTRAINT [FK_bos_user_module_AD_USER_CREDENTIALS] FOREIGN KEY([user_id])
REFERENCES [dbo].[AD_USER_CREDENTIALS] ([USER_ID])
GO

ALTER TABLE [dbo].[bos_user_module] CHECK CONSTRAINT [FK_bos_user_module_AD_USER_CREDENTIALS]
GO

ALTER TABLE [dbo].[bos_user_module]  WITH CHECK ADD  CONSTRAINT [FK_bos_user_module_bos_modules] FOREIGN KEY([module_id])
REFERENCES [dbo].[bos_modules] ([module_id])
GO

ALTER TABLE [dbo].[bos_user_module] CHECK CONSTRAINT [FK_bos_user_module_bos_modules]
GO

 
/****** Object:  Table [dbo].[bos_user_sub_modules]    Script Date: 08-05-2026 17:43:33 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[bos_user_sub_modules](
	[user_id] [nvarchar](50) NOT NULL,
	[sub_mod_id] [int] NOT NULL,
	[mod_id] [int] NOT NULL,
	[enabled] [int] NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[bos_user_sub_modules]  WITH CHECK ADD  CONSTRAINT [FK_bos_user_sub_modules_AD_USER_CREDENTIALS] FOREIGN KEY([user_id])
REFERENCES [dbo].[AD_USER_CREDENTIALS] ([USER_ID])
GO

ALTER TABLE [dbo].[bos_user_sub_modules] CHECK CONSTRAINT [FK_bos_user_sub_modules_AD_USER_CREDENTIALS]
GO

ALTER TABLE [dbo].[bos_user_sub_modules]  WITH CHECK ADD  CONSTRAINT [FK_bos_user_sub_modules_bos_modules] FOREIGN KEY([mod_id])
REFERENCES [dbo].[bos_modules] ([module_id])
GO

ALTER TABLE [dbo].[bos_user_sub_modules] CHECK CONSTRAINT [FK_bos_user_sub_modules_bos_modules]
GO

ALTER TABLE [dbo].[bos_user_sub_modules]  WITH CHECK ADD  CONSTRAINT [FK_bos_user_sub_modules_bos_sub_modules] FOREIGN KEY([sub_mod_id])
REFERENCES [dbo].[bos_sub_modules] ([sub_mod_id])
GO

ALTER TABLE [dbo].[bos_user_sub_modules] CHECK CONSTRAINT [FK_bos_user_sub_modules_bos_sub_modules]
GO


/****** Object:  Table [dbo].[bos_user_page_auth]    Script Date: 08-05-2026 17:59:45 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[bos_user_page_auth](
	[user_id] [nvarchar](50) NOT NULL,
	[page_id] [int] NOT NULL,
	[sub_mod_id] [int] NULL,
	[mod_id] [int] NOT NULL,
	[enable] [int] NULL,
	[read_acs] [int] NULL,
	[write] [int] NULL,
	[delete_acs] [int] NULL,
	[export] [int] NULL,
	[approval] [int] NULL,
	[manager] [int] NULL,
	[additional1] [int] NULL,
	[additional2] [int] NULL
) ON [PRIMARY]
GO
