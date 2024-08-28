#!/usr/bin/env python
import wx

class Kwismaster(wx.Frame):

    def __init__(self, parent, title):
        super(Kwismaster, self).__init__(parent, title=title)

        self.InitUI()
        self.Centre()
        self.Show()

    def InitUI(self):
        pnl = wx.Panel(self)
        nb = wx.Notebook(pnl)


        pnl1 = wx.Panel(nb)
        pnl1_FileOverView = wx.TreeCtrl(pnl1, size=(200,200))
        pnl1Sizer = wx.BoxSizer(wx.VERTICAL)
        pnl1Sizer.Add(pnl1Sizer)

        pnl2 = wx.Panel(nb)

        
        nb.AddPage(pnl1, "Questions")
        nb.AddPage(pnl2, "Settings")
        sizer = wx.BoxSizer(wx.VERTICAL)
        sizer.Add(nb, wx.EXPAND)

        pnl.SetSizer(sizer)


def main():

    app = wx.App()
    ex = Kwismaster(None, title='Kwismaster')
    ex.Show()
    app.MainLoop()


if __name__ == '__main__':
    main()