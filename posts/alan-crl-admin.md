---
title: Microsoft Office/PowerPoint 无法以普通用户权限运行的解决方案
date: 2024-11-21
tags: [wps, ppt, c#]
---

这些程序运行时就以管理员权限运行了，并且没有`兼容性`选项卡 ，接下来教你如何通过修改注册表取消 Office 默认以管理员身份运行。

---

## 转发者注明！

版权声明：本文原作者为 Alan-CRL，遵循 [CC 4.0 BY-SA](http://creativecommons.org/licenses/by-sa/4.0/) 版权协议，转载请附上[原文出处链接](https://blog.csdn.net/alan16356/article/details/143625981)和本声明。

### 步骤

#### Win+R 输入 `regedit`

#### 打开路径一

打开 `HKEY_CURRENT_USER\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers` 看看有没有相关程序，如果有则删除。

![在这里插入图片描述](/26082201.png)

#### 打开路径二

打开 `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers` 看看有没有相关程序，如果有则删除。  
![在这里插入图片描述](/26082202.png)

#### 最后

重启计算机就可以了。

### 附件

如果您使用的是 WPS，原理一样。也是在这两个目录中看看有没有包含 ksolaunch.exe 的项，如果有请删除就可以了。
